import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateWholesaleRequestDto } from './dto/create-wholesale-request.dto';
import { MIN_WHOLESALE_QTY, WholesaleService } from './wholesale.service';

@Controller('wholesale')
export class WholesaleController {
  constructor(private readonly wholesale: WholesaleService) {}

  @Get('config')
  config() {
    return { minQty: MIN_WHOLESALE_QTY };
  }

  @Post('requests')
  create(@Body() dto: CreateWholesaleRequestDto) {
    return this.wholesale.create(dto);
  }
}
