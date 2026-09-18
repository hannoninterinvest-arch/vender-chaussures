import { Module } from '@nestjs/common';
import { FxService } from './fx.service';
import { GeoService } from './geo.service';
import { ShippingController } from './shipping.controller';

@Module({
  controllers: [ShippingController],
  providers: [GeoService, FxService],
  exports: [GeoService, FxService],
})
export class ShippingModule {}
