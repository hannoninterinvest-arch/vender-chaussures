import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { CloudinaryService } from './cloudinary.service';
import { SellerController } from './seller.controller';
import { SellerGuard } from './seller.guard';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [SellerController],
  providers: [SellerGuard, CloudinaryService],
})
export class SellerModule {}
