import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { ShippingService } from './shipping.service';

@Controller('admin/shipping-rates')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AdminShippingController {
  constructor(private readonly shipping: ShippingService) {}

  @Get()
  list() {
    return this.shipping.listRates();
  }

  @Post()
  create(@Body() dto: CreateShippingRateDto) {
    return this.shipping.createRate(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShippingRateDto) {
    return this.shipping.updateRate(id, dto);
  }
}
