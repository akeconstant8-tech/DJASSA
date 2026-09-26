import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StockModule } from '../stock/stock.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [StockModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
