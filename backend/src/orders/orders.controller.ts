import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Commandes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /** Créer une commande (acheteur) */
  @Post()
  @ApiOperation({ summary: 'Valider le panier et créer une commande (avec réservation de stock)' })
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.orders.create(dto, req.user.sub);
  }

  /** Détail d'une commande (acheteur) */
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une commande' })
  getOne(@Param('id') id: string, @Request() req: any) {
    return this.orders.getOrderForBuyer(id, req.user.sub);
  }

  /** Commandes reçues (vendeur) */
  @Get('seller/mine')
  @ApiOperation({ summary: 'Commandes reçues par le vendeur connecté' })
  sellerOrders(@Query('status') status: string, @Request() req: any) {
    return this.orders.getSellerOrders(req.user.sellerId, status);
  }

  /** Changer le statut d'une sous-commande (vendeur) */
  @Patch('seller/:id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une commande vendeur' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.orders.updateSellerOrderStatus(id, status, req.user.sellerId);
  }
}
