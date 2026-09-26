import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// ── Routes publiques (vitrine acheteur) ──────────────────────────────────────
@ApiTags('Catalogue — public')
@Controller('products')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des produits en ligne (vitrine acheteur)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  listPublic(
    @Query('search') search?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('sellerId') sellerId?: string,
    @Query('page') page?: number,
  ) {
    return this.catalog.listPublic({ search, categorySlug, sellerId, page });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un produit' })
  getPublic(@Param('id') id: string) {
    return this.catalog.getPublic(id);
  }
}

// ── Routes vendeur (espace privé) ────────────────────────────────────────────
@ApiTags('Catalogue — vendeur')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('seller/products')
export class SellerCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Tous les produits du vendeur connecté' })
  listMine(@Request() req: any) {
    return this.catalog.listBySeller(req.user.sellerId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un produit' })
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    return this.catalog.create(dto, req.user.sellerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un produit' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Request() req: any) {
    return this.catalog.update(id, dto, req.user.sellerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archiver un produit (suppression logique — RG-12)' })
  archive(@Param('id') id: string, @Request() req: any) {
    return this.catalog.archive(id, req.user.sellerId);
  }
}
