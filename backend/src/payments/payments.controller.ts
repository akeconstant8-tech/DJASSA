import { Controller, Post, Body, Param, Headers, UseGuards, Request, RawBodyRequest, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Paiements')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Initier un paiement (acheteur connecté) */
  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initier un paiement pour une commande' })
  initiate(
    @Body('orderId') orderId: string,
    @Body('provider') provider: string,
    @Request() req: any,
  ) {
    return this.payments.initiate(orderId, provider, req.user.sub);
  }

  /**
   * Webhook de confirmation de paiement.
   * RG-05 : la signature est vérifiée avant tout traitement.
   * Accessible sans authentification JWT (appel depuis le fournisseur).
   */
  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Webhook du fournisseur de paiement (ne pas appeler manuellement)' })
  webhook(
    @Param('provider') provider: string,
    @Body() body: Record<string, any>,
    @Headers('x-webhook-signature') signature: string,
  ) {
    return this.payments.handleWebhook(body, signature, provider);
  }
}
