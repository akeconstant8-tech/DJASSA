import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SellersModule } from './sellers/sellers.module';
import { CatalogModule } from './catalog/catalog.module';
import { StockModule } from './stock/stock.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // Variables d'environnement disponibles partout
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting : 100 requêtes / minute par IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    PrismaModule,
    AuthModule,
    SellersModule,
    CatalogModule,
    StockModule,
    OrdersModule,
    PaymentsModule,
  ],
})
export class AppModule {}
