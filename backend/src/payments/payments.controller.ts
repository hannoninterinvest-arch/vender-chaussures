import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { KonnectService } from './konnect.service';

const webhookPipe = new ValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
});

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly orders: OrdersService,
    private readonly konnect: KonnectService,
  ) {}

  @Get('config')
  config() {
    return { online: this.konnect.configured() };
  }

  /** Konnect notifie ce webhook en GET (payment_ref en query). */
  @Get('konnect/webhook')
  webhookGet(
    @Query('payment_ref') paymentRef?: string,
    @Query('paymentRef') paymentRefAlt?: string,
  ) {
    return this.orders.confirmKonnect(paymentRef || paymentRefAlt || '');
  }

  @Post('konnect/webhook')
  @UsePipes(webhookPipe)
  webhookPost(
    @Query('payment_ref') paymentRef?: string,
    @Query('paymentRef') paymentRefAlt?: string,
    @Body() body?: { paymentRef?: string; payment_ref?: string },
  ) {
    const ref =
      paymentRef || paymentRefAlt || body?.paymentRef || body?.payment_ref || '';
    return this.orders.confirmKonnect(ref);
  }
}
