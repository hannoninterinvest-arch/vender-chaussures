import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catalog } from './catalog';
import { Product } from './product.entity';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async onModuleInit() {
    for (const item of catalog) {
      const exists = await this.products.findOne({ where: { id: item.id } });
      if (!exists) {
        await this.products.save(this.products.create(item));
      }
    }
  }

  async findAll() {
    const rows = await this.products.find({ order: { name: 'ASC' } });
    return rows.map((p) => this.toClient(p));
  }

  async findOne(id: string) {
    const product = await this.products.findOne({ where: { id } });
    return product ? this.toClient(product) : null;
  }

  private toClient(product: Product) {
    return { ...product, price: Number(product.price) };
  }
}
