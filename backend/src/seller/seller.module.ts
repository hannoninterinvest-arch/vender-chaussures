import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { SiteModule } from '../site/site.module';
import { WholesaleModule } from '../wholesale/wholesale.module';
import { CloudinaryService } from './cloudinary.service';
import { SellerController } from './seller.controller';

@Module({
  imports: [ProductsModule, OrdersModule, AuthModule, SiteModule, WholesaleModule],
  controllers: [SellerController],
  providers: [CloudinaryService],
})
export class SellerModule {}
