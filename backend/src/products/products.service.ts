import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catalog, categorySeed } from './catalog';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

export function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `item-${Date.now()}`;
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async onModuleInit() {
    for (const item of categorySeed) {
      const exists = await this.categories.findOne({ where: { id: item.id } });
      if (!exists) await this.categories.save(this.categories.create(item));
    }
    for (const item of catalog) {
      const exists = await this.products.findOne({ where: { id: item.id } });
      if (!exists) {
        await this.products.save(
          this.products.create({ ...item, cost: Math.round(item.price * 0.62) }),
        );
      }
    }
  }

  async findAll() {
    const rows = await this.products.find({ order: { name: 'ASC' } });
    return rows.map((p) => this.toPublic(p));
  }

  async findAllSeller() {
    const rows = await this.products.find({ order: { name: 'ASC' } });
    return rows.map((p) => this.toSeller(p));
  }

  async findOne(id: string) {
    const product = await this.getEntity(id);
    return product ? this.toPublic(product) : null;
  }

  async getEntity(id: string) {
    return this.products.findOne({ where: { id } });
  }

  async listCategories() {
    return this.categories.find({ order: { label: 'ASC' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    const id = slugify(dto.id?.trim() || dto.label);
    const exists = await this.categories.findOne({ where: { id } });
    if (exists) throw new BadRequestException('Cette catégorie existe déjà');
    const row = this.categories.create({
      id,
      label: dto.label.trim(),
      image: dto.image?.trim() || '',
    });
    return this.categories.save(row);
  }

  async removeCategory(id: string) {
    const row = await this.categories.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Catégorie introuvable');
    await this.categories.remove(row);
    return { ok: true };
  }

  async resolveCategory(value: string) {
    const raw = value.trim();
    if (!raw) throw new BadRequestException('Catégorie manquante');
    const byId = await this.categories.findOne({ where: { id: slugify(raw) } });
    if (byId) return byId.id;
    const all = await this.categories.find();
    const byLabel = all.find(
      (c) => c.label.trim().toLowerCase() === raw.toLowerCase() || c.id === raw,
    );
    if (byLabel) return byLabel.id;
    throw new BadRequestException(`Catégorie inconnue : ${raw}`);
  }

  async importMany(dtos: CreateProductDto[]) {
    const created: Awaited<ReturnType<ProductsService['create']>>[] = [];
    const errors: { index: number; name: string; message: string }[] = [];
    for (let i = 0; i < dtos.length; i++) {
      const dto = dtos[i];
      try {
        const category = await this.resolveCategory(dto.category);
        created.push(await this.create({ ...dto, category }));
      } catch (err) {
        errors.push({
          index: i,
          name: dto.name || `ligne ${i + 2}`,
          message: err instanceof Error ? err.message : 'Import impossible',
        });
      }
    }
    return { created: created.length, products: created, errors };
  }

  async create(dto: CreateProductDto) {
    const id = await this.uniqueId(slugify(dto.id?.trim() || dto.name));
    const product = this.products.create({
      id,
      name: dto.name.trim(),
      brand: dto.brand.trim(),
      price: dto.price,
      cost: dto.cost ?? 0,
      description: dto.description.trim(),
      gender: dto.gender,
      category: dto.category,
      isNew: dto.isNew ?? true,
      featured: dto.featured ?? false,
      colors: dto.colors,
      sizes: dto.sizes,
      images: dto.images.filter(Boolean).slice(0, 5),
    });
    return this.toSeller(await this.products.save(product));
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.getEntity(id);
    if (!product) throw new NotFoundException('Produit introuvable');
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.brand !== undefined) product.brand = dto.brand.trim();
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.cost !== undefined) product.cost = dto.cost;
    if (dto.description !== undefined) product.description = dto.description.trim();
    if (dto.gender !== undefined) product.gender = dto.gender;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.isNew !== undefined) product.isNew = dto.isNew;
    if (dto.featured !== undefined) product.featured = dto.featured;
    if (dto.colors !== undefined) product.colors = dto.colors;
    if (dto.sizes !== undefined) product.sizes = dto.sizes;
    if (dto.images !== undefined) product.images = dto.images.filter(Boolean).slice(0, 5);
    return this.toSeller(await this.products.save(product));
  }

  async remove(id: string) {
    const product = await this.getEntity(id);
    if (!product) throw new NotFoundException('Produit introuvable');
    await this.products.remove(product);
    return { ok: true };
  }

  private async uniqueId(base: string) {
    let id = base;
    let n = 2;
    while (await this.products.exists({ where: { id } })) {
      id = `${base}-${n++}`;
    }
    return id;
  }

  toPublic(product: Product) {
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      description: product.description,
      gender: product.gender,
      category: product.category,
      isNew: product.isNew,
      featured: Boolean(product.featured),
      colors: product.colors,
      sizes: product.sizes,
      images: product.images,
    };
  }

  toSeller(product: Product) {
    return { ...this.toPublic(product), cost: Number(product.cost) || 0 };
  }
}
