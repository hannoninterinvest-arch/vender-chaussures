import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { FlouciService } from './flouci.service';
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
    private readonly flouci: FlouciService,
  ) {}

  @Get('config')
  config() {
    return { online: this.konnect.configured(), flouci: this.flouci.configured() };
  }

  // Webhook is only a trigger: status, amount and order are verified using the authenticated API.
  @Get('flouci/webhook')
  webhookFlouci(@Query('payment_id') paymentId?: string) {
    return this.orders.confirmFlouci(paymentId || '');
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
