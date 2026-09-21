import { Body, Controller, Get, Post } from '@nestjs/common';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  @Get('info')
  info() {
    return this.shipping.info();
  }

  @Post('calculate')
  async calculate(@Body() dto: CalculateShippingDto) {
    return this.shipping.quote(dto.country, dto.carrier, dto.weightKg);
  }
}
