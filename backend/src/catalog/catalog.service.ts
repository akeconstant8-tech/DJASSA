import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Vitrine publique ──────────────────────────────────────────────────────

  /** Liste des produits en ligne pour la vitrine acheteur */
  async listPublic(query: { categorySlug?: string; sellerId?: string; search?: string; page?: number }) {
    const page = query.page ?? 1;
    const take = 24;
    const skip = (page - 1) * take;

    const where: any = {
      status: ProductStatus.ONLINE,
      deletedAt: null,
      seller: { status: 'ACTIVE' },
    };

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.sellerId) {
      where.sellerId = query.sellerId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          seller: { select: { id: true, shopName: true, city: true } },
          category: { select: { name: true, slug: true } },
          variants: {
            include: {
              stockLevels: { select: { qtyOnHand: true, qtyReserved: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.formatPublicProduct(p)),
      meta: { page, take, total, totalPages: Math.ceil(total / take) },
    };
  }

  /** Détail d'un produit public */
  async getPublic(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, status: ProductStatus.ONLINE, deletedAt: null },
      include: {
        seller: { select: { id: true, shopName: true, city: true } },
        category: { select: { name: true, slug: true } },
        variants: {
          include: {
            stockLevels: { select: { qtyOnHand: true, qtyReserved: true } },
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable.');
    return this.formatPublicProduct(product);
  }

  // ── Espace vendeur ────────────────────────────────────────────────────────

  async listBySeller(sellerId: string) {
    const products = await this.prisma.product.findMany({
      where: { sellerId, deletedAt: null },
      include: {
        category: { select: { name: true } },
        variants: {
          include: { stockLevels: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return products;
  }

  async create(dto: CreateProductDto, sellerId: string) {
    return this.prisma.product.create({
      data: {
        sellerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        status: ProductStatus.DRAFT,
        variants: {
          create: dto.variants.map((v) => ({
            sellerId,
            sku: v.sku,
            price: v.price,
            originalPrice: v.originalPrice,
            costPrice: v.costPrice ?? 0,
            alertThreshold: v.alertThreshold ?? 5,
            imageUrls: v.imageUrls ?? [],
            attributes: v.attributes ?? {},
          })),
        },
      },
      include: { variants: true },
    });
  }

  async update(productId: string, dto: UpdateProductDto, sellerId: string) {
    await this.assertOwner(productId, sellerId);
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        categoryId: dto.categoryId,
      },
    });
  }

  /** Suppression logique (RG-12) */
  async archive(productId: string, sellerId: string) {
    await this.assertOwner(productId, sellerId);
    return this.prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), status: ProductStatus.ARCHIVED },
    });
  }

  // ── Helpers privés ────────────────────────────────────────────────────────

  private async assertOwner(productId: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) throw new NotFoundException('Produit introuvable.');
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres produits.');
    }
    return product;
  }

  private formatPublicProduct(p: any) {
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      seller: p.seller,
      variants: p.variants.map((v: any) => {
        const totalOnHand = v.stockLevels.reduce((s: number, sl: any) => s + sl.qtyOnHand, 0);
        const totalReserved = v.stockLevels.reduce((s: number, sl: any) => s + sl.qtyReserved, 0);
        const qtyAvailable = totalOnHand - totalReserved;
        return {
          id: v.id,
          sku: v.sku,
          price: v.price,
          originalPrice: v.originalPrice,
          imageUrls: v.imageUrls,
          attributes: v.attributes,
          alertThreshold: v.alertThreshold,
          qtyAvailable,
          stockStatus:
            qtyAvailable === 0
              ? 'RUPTURE'
              : qtyAvailable <= v.alertThreshold
              ? 'BAS'
              : 'OK',
        };
      }),
    };
  }
}
