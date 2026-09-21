import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { FlouciService } from './flouci.service';

const webhookPipe = new ValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
});

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly orders: OrdersService,
    private readonly flouci: FlouciService,
  ) {}

  @Get('config')
  config() {
    return { online: this.flouci.configured(), provider: 'flouci' };
  }

  @Get('flouci/webhook')
  webhookGet(
    @Query('payment_id') paymentId?: string,
    @Query('paymentId') paymentIdAlt?: string,
  ) {
    return this.orders.confirmOnline(paymentId || paymentIdAlt || '');
  }

  @Post('flouci/webhook')
  @UsePipes(webhookPipe)
  webhookPost(
    @Query('payment_id') paymentId?: string,
    @Query('paymentId') paymentIdAlt?: string,
    @Body()
    body?: {
      payment_id?: string;
      paymentId?: string;
      payment_ref?: string;
    },
  ) {
    const ref =
      paymentId ||
      paymentIdAlt ||
      body?.payment_id ||
      body?.paymentId ||
      body?.payment_ref ||
      '';
    return this.orders.confirmOnline(ref);
  }
}
