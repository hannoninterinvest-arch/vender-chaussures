import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto);
    return {
      ...this.ordersService.toClient(order),
      payUrl: order.payUrl || '',
    };
  }

  @Post(':id/pay')
  async retryPay(@Param('id') id: string) {
    const order = await this.ordersService.retryPayment(id);
    return {
      ...this.ordersService.toClient(order),
      payUrl: order.payUrl || '',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
