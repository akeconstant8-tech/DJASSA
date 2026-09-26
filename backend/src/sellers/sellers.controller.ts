import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SellersService } from './sellers.service';

@ApiTags('Vendeurs')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellers: SellersService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des boutiques actives' })
  list() {
    return this.sellers.listActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Page publique d\'une boutique' })
  getOne(@Param('id') id: string) {
    return this.sellers.getPublic(id);
  }

  @Get('me/dashboard')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard du vendeur connecté' })
  dashboard(@Request() req: any) {
    return this.sellers.getDashboard(req.user.sellerId);
  }
}
