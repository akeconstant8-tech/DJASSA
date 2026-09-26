import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liste publique des boutiques actives */
  async listActive() {
    return this.prisma.seller.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        shopName: true,
        description: true,
        city: true,
        logoUrl: true,
        _count: { select: { products: true } },
      },
      orderBy: { shopName: 'asc' },
    });
  }

  /** Page publique d'une boutique */
  async getPublic(sellerId: string) {
    const seller = await this.prisma.seller.findFirst({
      where: { id: sellerId, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        shopName: true,
        description: true,
        city: true,
        logoUrl: true,
      },
    });
    if (!seller) throw new NotFoundException('Boutique introuvable.');
    return seller;
  }

  /** Dashboard stock du vendeur connecté */
  async getDashboard(sellerId: string) {
    const [totalProducts, stockStats, recentOrders] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { sellerId, deletedAt: null, status: 'ONLINE' } }),
      this.prisma.stockLevel.aggregate({
        where: { sellerId },
        _sum: { qtyOnHand: true, qtyReserved: true },
      }),
      this.prisma.sellerOrder.count({ where: { sellerId, status: 'PENDING' } }),
    ]);

    // Produits en rupture et en stock bas
    const lowStock = await this.prisma.stockLevel.findMany({
      where: { sellerId },
      include: {
        variant: { select: { sku: true, alertThreshold: true, product: { select: { title: true } } } },
      },
    });

    const ruptures = lowStock.filter(
      (sl) => sl.qtyOnHand - sl.qtyReserved <= 0,
    ).length;
    const stockBas = lowStock.filter(
      (sl) =>
        sl.qtyOnHand - sl.qtyReserved > 0 &&
        sl.qtyOnHand - sl.qtyReserved <= sl.variant.alertThreshold,
    ).length;

    return {
      totalProducts,
      totalUnitsOnHand: stockStats._sum.qtyOnHand ?? 0,
      totalUnitsReserved: stockStats._sum.qtyReserved ?? 0,
      ruptures,
      stockBas,
      pendingOrders: recentOrders,
    };
  }
}
