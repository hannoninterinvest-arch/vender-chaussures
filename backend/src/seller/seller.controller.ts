import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateCategoryDto } from '../products/dto/create-category.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { ProductsService } from '../products/products.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrdersService } from '../orders/orders.service';
import { SellerLoginDto } from './dto/seller-login.dto';
import { keysMatch, SellerGuard, sellerKey } from './seller.guard';

@Controller('seller')
export class SellerController {
  constructor(
    private readonly products: ProductsService,
    private readonly orders: OrdersService,
    private readonly config: ConfigService,
  ) {}

  @Post('session')
  session(@Body() dto: SellerLoginDto) {
    if (!keysMatch(dto.key, sellerKey(this.config))) {
      throw new UnauthorizedException('Clé vendeur invalide');
    }
    return { ok: true };
  }

  @Get('stats')
  @UseGuards(SellerGuard)
  stats() {
    return this.orders.stats();
  }

  @Get('orders')
  @UseGuards(SellerGuard)
  ordersList() {
    return this.orders.findAll();
  }

  @Patch('orders/:id')
  @UseGuards(SellerGuard)
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Get('products')
  @UseGuards(SellerGuard)
  productsList() {
    return this.products.findAllSeller();
  }

  @Post('products')
  @UseGuards(SellerGuard)
  createProduct(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch('products/:id')
  @UseGuards(SellerGuard)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(SellerGuard)
  removeProduct(@Param('id') id: string) {
    return this.products.remove(id);
  }

  @Get('categories')
  @UseGuards(SellerGuard)
  categories() {
    return this.products.listCategories();
  }

  @Post('categories')
  @UseGuards(SellerGuard)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.products.createCategory(dto);
  }

  @Delete('categories/:id')
  @UseGuards(SellerGuard)
  removeCategory(@Param('id') id: string) {
    return this.products.removeCategory(id);
  }
}
