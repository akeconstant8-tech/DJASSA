/**
 * StockService — seul point de modification du stock dans DJASSA.
 *
 * Toute opération (réservation, vente, libération, entrée manuelle)
 * passe ici. Chaque appel :
 *   1. Vérifie la disponibilité
 *   2. Met à jour stock_levels
 *   3. Écrit un mouvement dans stock_movements
 * Le tout dans une seule transaction Prisma.
 *
 * RÈGLE : ne jamais modifier stock_levels directement ailleurs.
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockMovementType } from '@prisma/client';
import { ManualMovementDto } from './dto/manual-movement.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Lecture ────────────────────────────────────────────────────────────────

  async getStockForVariant(variantId: string, sellerId?: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { stockLevels: { include: { location: true } } },
    });
    if (!variant) throw new NotFoundException('Variante introuvable.');
    if (sellerId && variant.sellerId !== sellerId) {
      throw new ForbiddenException('Accès interdit aux données d\'un autre vendeur.');
    }
    return variant.stockLevels.map((sl) => ({
      locationId: sl.locationId,
      locationName: sl.location.name,
      qtyOnHand: sl.qtyOnHand,
      qtyReserved: sl.qtyReserved,
      qtyAvailable: sl.qtyOnHand - sl.qtyReserved,
    }));
  }

  async getMovements(variantId: string, sellerId?: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variante introuvable.');
    if (sellerId && variant.sellerId !== sellerId) {
      throw new ForbiddenException('Accès interdit.');
    }
    return this.prisma.stockMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getSellerStockOverview(sellerId: string) {
    const levels = await this.prisma.stockLevel.findMany({
      where: { sellerId },
      include: {
        variant: { include: { product: { select: { title: true } } } },
        location: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return levels.map((sl) => ({
      variantId: sl.variantId,
      variantSku: sl.variant.sku,
      productTitle: sl.variant.product.title,
      locationName: sl.location.name,
      qtyOnHand: sl.qtyOnHand,
      qtyReserved: sl.qtyReserved,
      qtyAvailable: sl.qtyOnHand - sl.qtyReserved,
      alertThreshold: sl.variant.alertThreshold,
      status:
        sl.qtyOnHand - sl.qtyReserved === 0
          ? 'RUPTURE'
          : sl.qtyOnHand - sl.qtyReserved <= sl.variant.alertThreshold
          ? 'BAS'
          : 'OK',
      stockValue: sl.qtyOnHand * sl.variant.costPrice,
    }));
  }

  // ── Opérations sur le stock ────────────────────────────────────────────────

  /**
   * Réserve `qty` unités pour une commande.
   * RG-01 : qty_available ne peut jamais être négatif.
   * RG-02 : verrou transactionnel via Prisma.$transaction.
   */
  async reserve(variantId: string, locationId: string, qty: number, orderId: string, authorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const sl = await tx.stockLevel.findUniqueOrThrow({
        where: { variantId_locationId: { variantId, locationId } },
      });

      const available = sl.qtyOnHand - sl.qtyReserved;
      if (available < qty) {
        throw new BadRequestException(
          `Stock insuffisant. Disponible : ${available}, demandé : ${qty}.`,
        );
      }

      await tx.stockLevel.update({
        where: { variantId_locationId: { variantId, locationId } },
        data: { qtyReserved: { increment: qty } },
      });

      await tx.stockMovement.create({
        data: {
          variantId,
          locationId,
          sellerId: sl.sellerId,
          type: StockMovementType.RESERVATION,
          quantity: qty,
          reason: `Réservation commande ${orderId}`,
          sourceRef: orderId,
          authorId,
        },
      });
    });
  }

  /**
   * Libère une réservation (annulation ou expiration — RG-06, RG-03).
   */
  async release(variantId: string, locationId: string, qty: number, orderId: string, authorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const sl = await tx.stockLevel.findUniqueOrThrow({
        where: { variantId_locationId: { variantId, locationId } },
      });

      await tx.stockLevel.update({
        where: { variantId_locationId: { variantId, locationId } },
        data: { qtyReserved: { decrement: Math.min(qty, sl.qtyReserved) } },
      });

      await tx.stockMovement.create({
        data: {
          variantId,
          locationId,
          sellerId: sl.sellerId,
          type: StockMovementType.LIBERATION,
          quantity: qty,
          reason: `Libération commande ${orderId}`,
          sourceRef: orderId,
          authorId,
        },
      });
    });
  }

  /**
   * Convertit la réservation en vente après paiement confirmé (RG-04, RG-05).
   */
  async sell(variantId: string, locationId: string, qty: number, orderId: string, authorId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const sl = await tx.stockLevel.findUniqueOrThrow({
        where: { variantId_locationId: { variantId, locationId } },
      });

      await tx.stockLevel.update({
        where: { variantId_locationId: { variantId, locationId } },
        data: {
          qtyOnHand:  { decrement: qty },
          qtyReserved: { decrement: Math.min(qty, sl.qtyReserved) },
        },
      });

      await tx.stockMovement.create({
        data: {
          variantId,
          locationId,
          sellerId: sl.sellerId,
          type: StockMovementType.VENTE,
          quantity: qty,
          reason: `Vente confirmée commande ${orderId}`,
          sourceRef: orderId,
          authorId,
        },
      });
    });
  }

  /**
   * Mouvement manuel : entrée, sortie ou ajustement d'inventaire (RG-08).
   */
  async manualMovement(dto: ManualMovementDto, sellerId: string, authorId: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
    if (!variant) throw new NotFoundException('Variante introuvable.');
    if (variant.sellerId !== sellerId) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre stock.');
    }

    await this.prisma.$transaction(async (tx) => {
      const sl = await tx.stockLevel.findUniqueOrThrow({
        where: { variantId_locationId: { variantId: dto.variantId, locationId: dto.locationId } },
      });

      let delta = dto.quantity;
      if (dto.type === 'SORTIE') delta = -Math.abs(dto.quantity);
      if (dto.type === 'ENTREE') delta = Math.abs(dto.quantity);

      const newQtyOnHand = sl.qtyOnHand + delta;
      if (newQtyOnHand < 0) {
        throw new BadRequestException('Le stock physique ne peut pas être négatif.');
      }

      await tx.stockLevel.update({
        where: { variantId_locationId: { variantId: dto.variantId, locationId: dto.locationId } },
        data: { qtyOnHand: newQtyOnHand },
      });

      await tx.stockMovement.create({
        data: {
          variantId: dto.variantId,
          locationId: dto.locationId,
          sellerId,
          type: dto.type as StockMovementType,
          quantity: Math.abs(dto.quantity),
          reason: dto.reason,
          authorId,
        },
      });
    });
  }
}
