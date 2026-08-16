import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { KonnectModule } from './konnect.module';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [KonnectModule, OrdersModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
