import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminShippingController } from './admin-shipping.controller';
import { ShippingRate } from './shipping-rate.entity';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingRate]), AuthModule],
  controllers: [ShippingController, AdminShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
