import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { ManualMovementDto } from './dto/manual-movement.dto';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  /** Vue d'ensemble du stock du vendeur connecté */
  @Get('overview')
  @ApiOperation({ summary: 'Tableau de bord stock du vendeur connecté' })
  overview(@Request() req: any) {
    return this.stock.getSellerStockOverview(req.user.sellerId);
  }

  /** Niveaux de stock pour une variante */
  @Get('variants/:variantId')
  @ApiOperation({ summary: 'Niveaux de stock par variante et emplacement' })
  getVariantStock(@Param('variantId') variantId: string, @Request() req: any) {
    return this.stock.getStockForVariant(variantId, req.user.sellerId);
  }

  /** Historique des mouvements d'une variante */
  @Get('variants/:variantId/movements')
  @ApiOperation({ summary: 'Historique des mouvements de stock' })
  getMovements(@Param('variantId') variantId: string, @Request() req: any) {
    return this.stock.getMovements(variantId, req.user.sellerId);
  }

  /** Entrée / Sortie / Ajustement manuel */
  @Post('movements')
  @ApiOperation({ summary: 'Enregistrer un mouvement de stock manuel (entrée, sortie, ajustement)' })
  manualMovement(@Body() dto: ManualMovementDto, @Request() req: any) {
    return this.stock.manualMovement(dto, req.user.sellerId, req.user.sub);
  }
}
