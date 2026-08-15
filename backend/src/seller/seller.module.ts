import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { SellerController } from './seller.controller';
import { SellerGuard } from './seller.guard';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [SellerController],
  providers: [SellerGuard],
})
export class SellerModule {}
