import { Module } from '@nestjs/common';
import { CatalogController, SellerCatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CatalogController, SellerCatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
