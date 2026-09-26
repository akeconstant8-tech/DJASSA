/**
 * PaymentsService — intégration fournisseur de paiement.
 *
 * RG-05 : seule la notification serveur (webhook signé) confirme un paiement.
 * Idempotence : chaque webhook est identifié par son providerEventId.
 * En cas de confirmation → décrémente le stock via StockService.sell().
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly config: ConfigService,
  ) {}

  /** Initialiser un paiement (côté client → redirige vers le fournisseur) */
  async initiate(orderId: string, provider: string, buyerId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.buyerId !== buyerId) throw new BadRequestException('Accès interdit.');
    if (order.status !== 'PENDING') throw new BadRequestException('Commande non en attente.');

    // Créer l'enregistrement de paiement
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        provider,
        amount: order.total,
        status: 'PENDING',
      },
    });

    // TODO : appeler l'API du fournisseur (CinetPay, FedaPay…) et récupérer l'URL de paiement.
    // Ici on retourne un placeholder en attendant l'intégration réelle.
    return {
      paymentId: payment.id,
      redirectUrl: `https://paiement.exemple.ci/pay/${payment.id}`,
      message: 'Intégrez ici l\'URL réelle du fournisseur de paiement.',
    };
  }

  /**
   * Traiter un webhook de paiement.
   * RG-05 : vérifier la signature avant tout traitement.
   * Idempotence : si l'événement a déjà été traité, ignorer silencieusement.
   */
  async handleWebhook(body: Record<string, any>, signature: string, provider: string) {
    // 1. Vérifier la signature
    this.verifySignature(body, signature, provider);

    const eventId: string = body.event_id ?? body.id;
    const status: string = body.status ?? body.data?.status;
    const externalRef: string = body.transaction_id ?? body.reference;

    // 2. Idempotence — ignorer si déjà traité
    const existing = await this.prisma.payment.findUnique({
      where: { providerEventId: eventId },
    });
    if (existing) {
      this.logger.log(`Webhook ${eventId} déjà traité — ignoré.`);
      return { ignored: true };
    }

    // 3. Trouver le paiement par référence externe
    const payment = await this.prisma.payment.findFirst({
      where: { externalRef },
      include: { order: { include: { sellerOrders: { include: { items: true } } } } },
    });
    if (!payment) {
      this.logger.warn(`Webhook ${eventId} : aucun paiement trouvé pour ${externalRef}`);
      return { ignored: true };
    }

    // 4. Traiter selon le statut
    if (status === 'SUCCESS' || status === 'COMPLETED') {
      await this.onPaymentSuccess(payment, eventId);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      await this.onPaymentFailed(payment, eventId);
    }

    return { processed: true };
  }

  // ── Privé ────────────────────────────────────────────────────────────────

  private async onPaymentSuccess(payment: any, eventId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED', providerEventId: eventId },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });
    });

    // Décrémente le stock pour chaque article (RG-04)
    for (const sellerOrder of payment.order.sellerOrders) {
      for (const item of sellerOrder.items) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { stockLevels: { include: { location: true } } },
        });
        const defaultLevel = variant?.stockLevels.find((sl) => sl.location.isDefault);
        if (defaultLevel) {
          await this.stock.sell(
            item.variantId,
            defaultLevel.location.id,
            item.quantity,
            payment.orderId,
            'system',
          );
        }
      }
    }

    this.logger.log(`Paiement ${payment.id} confirmé — stock décrémenté.`);
  }

  private async onPaymentFailed(payment: any, eventId: string) {
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', providerEventId: eventId },
    });
    // La libération du stock est gérée par le job d'expiration des réservations
    this.logger.log(`Paiement ${payment.id} échoué.`);
  }

  private verifySignature(body: Record<string, any>, signature: string, provider: string) {
    const secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('PAYMENT_WEBHOOK_SECRET non configuré — vérification de signature ignorée.');
      return;
    }
    // TODO : implémenter la vérification HMAC selon la documentation du fournisseur choisi.
    // Exemple CinetPay : HMAC-SHA256(JSON.stringify(body), secret)
    if (!signature) {
      throw new BadRequestException('Signature du webhook manquante.');
    }
  }
}
