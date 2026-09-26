/**
 * Seed de développement — DJASSA
 * Crée 3 vendeurs, leurs produits, leurs variantes et leur stock initial.
 *
 * Usage : pnpm db:seed
 */

import { PrismaClient, UserRole, SellerStatus, ProductStatus, StockMovementType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Début du seed DJASSA...');

  // ── Catégories ───────────────────────────────────────────────────────────────
  const catElec = await prisma.category.upsert({
    where: { slug: 'electronique' },
    update: {},
    create: { name: 'Électronique', slug: 'electronique' },
  });
  const catMode = await prisma.category.upsert({
    where: { slug: 'mode-textile' },
    update: {},
    create: { name: 'Mode & Textile', slug: 'mode-textile' },
  });
  const catBio = await prisma.category.upsert({
    where: { slug: 'beaute-bio' },
    update: {},
    create: { name: 'Beauté & Bio', slug: 'beaute-bio' },
  });

  // ── Vendeur 1 : TechHub Abidjan ──────────────────────────────────────────────
  const pwdHash = await argon2.hash('password');

  const user1 = await prisma.user.upsert({
    where: { email: 'amara.toure@djassa.ci' },
    update: {},
    create: {
      email: 'amara.toure@djassa.ci',
      phone: '+22507489211',
      passwordHash: pwdHash,
      role: UserRole.SELLER,
    },
  });
  const seller1 = await prisma.seller.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      shopName: 'TechHub Abidjan',
      description: 'Spécialiste en périphériques PC et audio haute fidélité.',
      city: 'Abidjan',
      commissionRate: 500,
      status: SellerStatus.ACTIVE,
    },
  });
  const loc1 = await prisma.location.upsert({
    where: { id: `${seller1.id}-default` },
    update: {},
    create: {
      id: `${seller1.id}-default`,
      sellerId: seller1.id,
      name: 'Entrepôt principal',
      address: 'Zone 4, Abidjan',
      isDefault: true,
    },
  });

  // Produits TechHub
  const products1 = [
    {
      sku: 'EL-KEY-0941',
      title: 'Keychron K2 Pro Sans Fil',
      description: 'Clavier mécanique sans fil compact 75% avec switchs tactiles pré-lubrifiés, rétroéclairage RGB personnalisable.',
      categoryId: catElec.id,
      price: 65000,
      originalPrice: 72000,
      costPrice: 40000,
      alertThreshold: 5,
      initialStock: 42,
      imageUrls: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400'],
    },
    {
      sku: 'EL-MOU-3312',
      title: 'Souris Gaming Verticale Ergonomique',
      description: 'Prise en main ergonomique 57°, capteur 16 000 DPI, boutons programmables.',
      categoryId: catElec.id,
      price: 22500,
      costPrice: 12000,
      alertThreshold: 3,
      initialStock: 18,
      imageUrls: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
    },
    {
      sku: 'EL-AUD-9904',
      title: 'Casque Audio ANC Haute Fidélité',
      description: 'Réduction active du bruit adaptative, 40 heures d\'autonomie, coussinets mémoire de forme.',
      categoryId: catElec.id,
      price: 115000,
      costPrice: 70000,
      alertThreshold: 2,
      initialStock: 4,
      imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    },
    {
      sku: 'EL-GAN-100W',
      title: 'Chargeur Rapide 100W GaN Multi-Ports',
      description: 'Technologie GaN III, charge simultanée MacBook + smartphone + écouteurs.',
      categoryId: catElec.id,
      price: 28000,
      originalPrice: 32000,
      costPrice: 15000,
      alertThreshold: 3,
      initialStock: 2,
      imageUrls: ['https://images.unsplash.com/photo-1609592424975-78e1e8e3e97e?w=400'],
    },
  ];

  for (const p of products1) {
    const product = await prisma.product.upsert({
      where: { id: `seed-${p.sku}` },
      update: {},
      create: {
        id: `seed-${p.sku}`,
        sellerId: seller1.id,
        categoryId: p.categoryId,
        title: p.title,
        description: p.description,
        status: ProductStatus.ONLINE,
      },
    });
    const variant = await prisma.productVariant.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        productId: product.id,
        sellerId: seller1.id,
        sku: p.sku,
        price: p.price,
        originalPrice: p.originalPrice,
        costPrice: p.costPrice,
        alertThreshold: p.alertThreshold,
        imageUrls: p.imageUrls,
      },
    });
    await prisma.stockLevel.upsert({
      where: { variantId_locationId: { variantId: variant.id, locationId: loc1.id } },
      update: {},
      create: {
        variantId: variant.id,
        locationId: loc1.id,
        sellerId: seller1.id,
        qtyOnHand: p.initialStock,
        qtyReserved: 0,
      },
    });
    await prisma.stockMovement.create({
      data: {
        variantId: variant.id,
        locationId: loc1.id,
        sellerId: seller1.id,
        type: StockMovementType.ENTREE,
        quantity: p.initialStock,
        reason: 'Stock initial (seed)',
        authorId: user1.id,
      },
    });
  }

  // ── Vendeur 2 : Wax & Style CI ───────────────────────────────────────────────
  const user2 = await prisma.user.upsert({
    where: { email: 'fatou.diallo@djassa.ci' },
    update: {},
    create: {
      email: 'fatou.diallo@djassa.ci',
      phone: '+22505771234',
      passwordHash: pwdHash,
      role: UserRole.SELLER,
    },
  });
  const seller2 = await prisma.seller.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      shopName: 'Wax & Style CI',
      description: 'Mode africaine authentique — wax, basin brodé et maroquinerie artisanale.',
      city: 'Abidjan',
      commissionRate: 500,
      status: SellerStatus.ACTIVE,
    },
  });
  const loc2 = await prisma.location.upsert({
    where: { id: `${seller2.id}-default` },
    update: {},
    create: {
      id: `${seller2.id}-default`,
      sellerId: seller2.id,
      name: 'Boutique Treichville',
      address: 'Treichville, Abidjan',
      isDefault: true,
    },
  });

  const products2 = [
    {
      sku: 'TX-WAX-8820',
      title: 'Pagne Wax Royal Pur Coton 6 yards',
      description: 'Tissu pagne wax hollandais véritable 100% coton peigné aux teintes chatoyantes.',
      categoryId: catMode.id,
      price: 48500,
      costPrice: 22000,
      alertThreshold: 5,
      initialStock: 25,
      imageUrls: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4e7b?w=400'],
    },
    {
      sku: 'TX-BAS-4401',
      title: 'Ensemble Basin Brodé Homme',
      description: 'Boubou basin riche brodé à la main, coupe moderne et tissu de qualité supérieure.',
      categoryId: catMode.id,
      price: 35000,
      costPrice: 18000,
      alertThreshold: 3,
      initialStock: 12,
      imageUrls: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400'],
    },
    {
      sku: 'TX-SAC-2201',
      title: 'Sac à Main Cuir Tressé Artisanal',
      description: 'Sac en cuir véritable tressé à la main par des artisanes ivoiriennes.',
      categoryId: catMode.id,
      price: 29000,
      costPrice: 13000,
      alertThreshold: 2,
      initialStock: 7,
      imageUrls: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'],
    },
  ];

  for (const p of products2) {
    const product = await prisma.product.upsert({
      where: { id: `seed-${p.sku}` },
      update: {},
      create: {
        id: `seed-${p.sku}`,
        sellerId: seller2.id,
        categoryId: p.categoryId,
        title: p.title,
        description: p.description,
        status: ProductStatus.ONLINE,
      },
    });
    const variant = await prisma.productVariant.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        productId: product.id,
        sellerId: seller2.id,
        sku: p.sku,
        price: p.price,
        costPrice: p.costPrice,
        alertThreshold: p.alertThreshold,
        imageUrls: p.imageUrls,
      },
    });
    await prisma.stockLevel.upsert({
      where: { variantId_locationId: { variantId: variant.id, locationId: loc2.id } },
      update: {},
      create: {
        variantId: variant.id,
        locationId: loc2.id,
        sellerId: seller2.id,
        qtyOnHand: p.initialStock,
        qtyReserved: 0,
      },
    });
    await prisma.stockMovement.create({
      data: {
        variantId: variant.id,
        locationId: loc2.id,
        sellerId: seller2.id,
        type: StockMovementType.ENTREE,
        quantity: p.initialStock,
        reason: 'Stock initial (seed)',
        authorId: user2.id,
      },
    });
  }

  // ── Vendeur 3 : Nature & Bio Market ─────────────────────────────────────────
  const user3 = await prisma.user.upsert({
    where: { email: 'kofi.mensah@djassa.sn' },
    update: {},
    create: {
      email: 'kofi.mensah@djassa.sn',
      phone: '+221771234567',
      passwordHash: pwdHash,
      role: UserRole.SELLER,
    },
  });
  const seller3 = await prisma.seller.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      shopName: 'Nature & Bio Market',
      description: 'Cosmétiques et compléments naturels bio, issus de coopératives d\'Afrique de l\'Ouest.',
      city: 'Dakar',
      commissionRate: 400,
      status: SellerStatus.ACTIVE,
    },
  });
  const loc3 = await prisma.location.upsert({
    where: { id: `${seller3.id}-default` },
    update: {},
    create: {
      id: `${seller3.id}-default`,
      sellerId: seller3.id,
      name: 'Entrepôt Dakar',
      address: 'Plateau, Dakar',
      isDefault: true,
    },
  });

  const products3 = [
    {
      sku: 'CS-KRT-500G',
      title: 'Beurre de Karité Bio 500g',
      description: 'Beurre de karité brut non raffiné extrait à froid par des coopératives ivoiriennes.',
      categoryId: catBio.id,
      price: 12900,
      costPrice: 4500,
      alertThreshold: 10,
      initialStock: 38,
      imageUrls: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
    },
    {
      sku: 'AG-MORINGA-250G',
      title: 'Poudre de Moringa Bio 250g',
      description: 'Poudre de feuilles de moringa séchées et moulues à froid, riche en protéines et vitamines.',
      categoryId: catBio.id,
      price: 8500,
      costPrice: 3000,
      alertThreshold: 15,
      initialStock: 60,
      imageUrls: ['https://images.unsplash.com/photo-1611001797893-d5fe7e48f4cf?w=400'],
    },
    {
      sku: 'CS-HUI-COCO-1L',
      title: 'Huile de Coco Vierge 1L',
      description: 'Huile de coco pressée à froid, non raffinée, certifiée biologique, usage alimentaire et cosmétique.',
      categoryId: catBio.id,
      price: 14200,
      costPrice: 5500,
      alertThreshold: 8,
      initialStock: 20,
      imageUrls: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'],
    },
  ];

  for (const p of products3) {
    const product = await prisma.product.upsert({
      where: { id: `seed-${p.sku}` },
      update: {},
      create: {
        id: `seed-${p.sku}`,
        sellerId: seller3.id,
        categoryId: p.categoryId,
        title: p.title,
        description: p.description,
        status: ProductStatus.ONLINE,
      },
    });
    const variant = await prisma.productVariant.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        productId: product.id,
        sellerId: seller3.id,
        sku: p.sku,
        price: p.price,
        costPrice: p.costPrice,
        alertThreshold: p.alertThreshold,
        imageUrls: p.imageUrls,
      },
    });
    await prisma.stockLevel.upsert({
      where: { variantId_locationId: { variantId: variant.id, locationId: loc3.id } },
      update: {},
      create: {
        variantId: variant.id,
        locationId: loc3.id,
        sellerId: seller3.id,
        qtyOnHand: p.initialStock,
        qtyReserved: 0,
      },
    });
    await prisma.stockMovement.create({
      data: {
        variantId: variant.id,
        locationId: loc3.id,
        sellerId: seller3.id,
        type: StockMovementType.ENTREE,
        quantity: p.initialStock,
        reason: 'Stock initial (seed)',
        authorId: user3.id,
      },
    });
  }

  console.log('✅  Seed terminé !');
  console.log('   Vendeurs créés : TechHub Abidjan · Wax & Style CI · Nature & Bio Market');
  console.log('   Mot de passe de dev (tous) : password');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
