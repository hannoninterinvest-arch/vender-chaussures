import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currency: CurrencyService) {}

  @Get()
  quote(@Query('country') country?: string) {
    return this.currency.quote(country || 'TN');
  }
}
