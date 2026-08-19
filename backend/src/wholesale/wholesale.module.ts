import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { WholesaleController } from './wholesale.controller';
import { WholesaleRequest } from './wholesale-request.entity';
import { WholesaleService } from './wholesale.service';

@Module({
  imports: [TypeOrmModule.forFeature([WholesaleRequest]), ProductsModule],
  controllers: [WholesaleController],
  providers: [WholesaleService],
  exports: [WholesaleService],
})
export class WholesaleModule {}
