/**
 * OrdersService — gestion des commandes multi-vendeurs.
 *
 * RG-10 : un panier multi-vendeurs génère une SellerOrder par vendeur,
 *          avec un seul paiement pour l'acheteur.
 * RG-03 : réservation à la validation, expiration après 30 min par défaut.
 * RG-01 : la réservation échoue si stock insuffisant — commande refusée.
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly expiryMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly config: ConfigService,
  ) {
    this.expiryMinutes = Number(this.config.get('RESERVATION_EXPIRY_MINUTES', 30));
  }

  // ── Création d'une commande ───────────────────────────────────────────────

  async create(dto: CreateOrderDto, buyerId: string): Promise<any> {
    // Idempotence : si la clé existe déjà, retourner la commande existante
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) return existing;

    // 1. Charger les variantes et leurs stocks
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        stockLevels: { include: { location: { select: { id: true, isDefault: true } } } },
        product: { select: { sellerId: true, status: true, deletedAt: true } },
      },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont introuvables.');
    }

    // 2. Vérifier disponibilité et prix (prix recalculé côté serveur)
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (variant.product.deletedAt || variant.product.status !== 'ONLINE') {
        throw new BadRequestException(`Le produit "${item.variantId}" n'est plus disponible.`);
      }
      const defaultLevel = variant.stockLevels.find((sl) => sl.location.isDefault);
      const available = defaultLevel
        ? defaultLevel.qtyOnHand - defaultLevel.qtyReserved
        : 0;
      if (available < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour la variante ${variant.sku}. Disponible : ${available}.`,
        );
      }
    }

    // 3. Calculer les sous-totaux par vendeur
    const sellerGroups = new Map<string, { items: typeof dto.items; subtotal: number }>();
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const sellerId = variant.product.sellerId;
      const lineTotal = variant.price * item.quantity; // prix côté serveur
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, { items: [], subtotal: 0 });
      }
      const group = sellerGroups.get(sellerId)!;
      group.items.push(item);
      group.subtotal += lineTotal;
    }

    const total = [...sellerGroups.values()].reduce((s, g) => s + g.subtotal, 0);
    const deliveryFee = total >= 50000 ? 0 : 2500;
    const reservedUntil = new Date(Date.now() + this.expiryMinutes * 60_000);

    // 4. Créer la commande et réserver le stock — tout dans une transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId,
          idempotencyKey: dto.idempotencyKey,
          total: total + deliveryFee,
          deliveryFee,
          buyerName: dto.buyerName,
          buyerPhone: dto.buyerPhone,
          buyerCity: dto.buyerCity,
          buyerAddress: dto.buyerAddress,
          buyerNotes: dto.buyerNotes,
          reservedUntil,
        },
      });

      // Une SellerOrder par vendeur (RG-10)
      for (const [sellerId, group] of sellerGroups) {
        const seller = await tx.seller.findUnique({ where: { id: sellerId } });
        const commission = Math.round(group.subtotal * (seller!.commissionRate / 10000));

        const sellerOrder = await tx.sellerOrder.create({
          data: {
            orderId: order.id,
            sellerId,
            subtotal: group.subtotal,
            commission,
          },
        });

        // Articles de la sous-commande
        for (const item of group.items) {
          const variant = variants.find((v) => v.id === item.variantId)!;
          await tx.orderItem.create({
            data: {
              sellerOrderId: sellerOrder.id,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: variant.price, // prix figé côté serveur
            },
          });
        }
      }

      return order;
    });

    // 5. Réserver le stock (hors transaction principale pour éviter les deadlocks)
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const defaultLevel = variant.stockLevels.find((sl) => sl.location.isDefault)!;
      await this.stock.reserve(
        item.variantId,
        defaultLevel.location.id,
        item.quantity,
        order.id,
        buyerId,
      );
    }

    return order;
  }

  // ── Lecture ────────────────────────────────────────────────────────────────

  async getOrderForBuyer(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        sellerOrders: {
          include: {
            seller: { select: { shopName: true } },
            items: { include: { variant: { select: { sku: true, price: true, imageUrls: true } } } },
          },
        },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('Commande introuvable.');
    if (order.buyerId !== buyerId) throw new ForbiddenException();
    return order;
  }

  async getSellerOrders(sellerId: string, status?: string) {
    return this.prisma.sellerOrder.findMany({
      where: {
        sellerId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        order: { select: { buyerName: true, buyerPhone: true, buyerCity: true, createdAt: true } },
        items: { include: { variant: { select: { sku: true, imageUrls: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSellerOrderStatus(sellerOrderId: string, status: string, sellerId: string) {
    const so = await this.prisma.sellerOrder.findUnique({ where: { id: sellerOrderId } });
    if (!so) throw new NotFoundException();
    if (so.sellerId !== sellerId) throw new ForbiddenException();

    // Si annulation → libérer le stock réservé (RG-06)
    if (status === 'CANCELLED' && so.status !== 'CANCELLED') {
      const items = await this.prisma.orderItem.findMany({ where: { sellerOrderId } });
      for (const item of items) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { stockLevels: { include: { location: true } } },
        });
        const defaultLevel = variant?.stockLevels.find((sl) => sl.location.isDefault);
        if (defaultLevel) {
          await this.stock.release(
            item.variantId,
            defaultLevel.location.id,
            item.quantity,
            so.orderId,
            sellerId,
          );
        }
      }
    }

    return this.prisma.sellerOrder.update({
      where: { id: sellerOrderId },
      data: { status: status as any },
    });
  }
}
