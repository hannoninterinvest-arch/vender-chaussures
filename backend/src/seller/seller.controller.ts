import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCategoryDto } from '../products/dto/create-category.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ImportProductsDto } from '../products/dto/import-products.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { ProductsService } from '../products/products.service';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrdersService } from '../orders/orders.service';
import { SiteService } from '../site/site.service';
import { UpdateSiteDto } from '../site/dto/update-site.dto';
import { UpdateWholesaleRequestDto } from '../wholesale/dto/update-wholesale-request.dto';
import { WholesaleService } from '../wholesale/wholesale.service';
import { CloudinaryService } from './cloudinary.service';

@Controller('seller')
@UseGuards(AuthGuard, RolesGuard)
export class SellerController {
  constructor(
    private readonly products: ProductsService,
    private readonly orders: OrdersService,
    private readonly uploads: CloudinaryService,
    private readonly site: SiteService,
    private readonly wholesale: WholesaleService,
  ) {}

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 40 * 1024 * 1024 },
    }),
  )
  uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Choisis une image ou une vidéo');
    return this.uploads.uploadMedia(file);
  }

  @Get('stats')
  stats() {
    return this.orders.stats();
  }

  @Get('orders')
  ordersList() {
    return this.orders.findAll();
  }

  @Patch('orders/:id')
  updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }

  @Get('products')
  productsList() {
    return this.products.findAllSeller();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Post('products/import')
  importProducts(@Body() dto: ImportProductsDto) {
    return this.products.importMany(dto.products);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete('products/:id')
  @Roles('admin')
  removeProduct(@Param('id') id: string) {
    return this.products.remove(id);
  }

  @Get('categories')
  categories() {
    return this.products.listCategories();
  }

  @Post('categories')
  @Roles('admin')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.products.createCategory(dto);
  }

  @Delete('categories/:id')
  @Roles('admin')
  removeCategory(@Param('id') id: string) {
    return this.products.removeCategory(id);
  }

  @Get('wholesale')
  wholesaleList() {
    return this.wholesale.findAll();
  }

  @Get('wholesale/stats')
  wholesaleStats() {
    return this.wholesale.stats();
  }

  @Patch('wholesale/:id')
  updateWholesale(@Param('id') id: string, @Body() dto: UpdateWholesaleRequestDto) {
    return this.wholesale.update(id, dto);
  }

  @Delete('wholesale/:id')
  @Roles('admin')
  removeWholesale(@Param('id') id: string) {
    return this.wholesale.remove(id);
  }

  @Get('site')
  siteHome() {
    return this.site.getHome();
  }

  @Patch('site')
  @Roles('admin')
  updateSite(@Body() dto: UpdateSiteDto) {
    return this.site.updateHome(dto);
  }
}
