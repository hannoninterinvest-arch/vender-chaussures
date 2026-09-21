import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { FlouciModule } from './flouci.module';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [FlouciModule, OrdersModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
