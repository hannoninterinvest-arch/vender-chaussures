import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sellingPrice } from '../products/pricing';
import { ProductsService } from '../products/products.service';
import { CreateWholesaleRequestDto } from './dto/create-wholesale-request.dto';
import { UpdateWholesaleRequestDto } from './dto/update-wholesale-request.dto';
import { WholesaleItem, WholesaleRequest } from './wholesale-request.entity';

/** Minimum de paires pour qu'une demande soit traitée en gros. */
export const MIN_WHOLESALE_QTY = 10;

@Injectable()
export class WholesaleService {
  constructor(
    @InjectRepository(WholesaleRequest)
    private readonly requests: Repository<WholesaleRequest>,
    private readonly products: ProductsService,
  ) {}

  async create(dto: CreateWholesaleRequestDto) {
    const items: WholesaleItem[] = [];
    let totalQty = 0;
    let retailTotal = 0;

    for (const line of dto.items) {
      const product = await this.products.getEntity(line.productId);
      if (!product) {
        throw new BadRequestException(`Produit inconnu : ${line.productId}`);
      }
      const retailPrice = sellingPrice(product);
      totalQty += line.qty;
      retailTotal += retailPrice * line.qty;
      items.push({
        productId: product.id,
        name: product.name,
        image: product.images[0] ?? '',
        qty: line.qty,
        retailPrice,
      });
    }

    if (totalQty < MIN_WHOLESALE_QTY) {
      throw new BadRequestException(
        `Commande en gros à partir de ${MIN_WHOLESALE_QTY} paires (total demandé : ${totalQty}).`,
      );
    }

    const row = this.requests.create({
      id: await this.nextId(),
      company: dto.company.trim(),
      contactName: dto.contactName.trim(),
      phone: dto.phone.trim(),
      email: dto.email?.trim() ?? '',
      gouvernorat: dto.gouvernorat?.trim() ?? '',
      city: dto.city?.trim() ?? '',
      message: dto.message?.trim() ?? '',
      items,
      totalQty,
      retailTotal,
      status: 'nouveau',
      staffNote: '',
    });

    return this.toClient(await this.requests.save(row));
  }

  async findAll() {
    const rows = await this.requests.find({ order: { createdAt: 'DESC' } });
    return rows.map((row) => this.toClient(row));
  }

  async update(id: string, dto: UpdateWholesaleRequestDto) {
    const row = await this.requests.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Demande introuvable');
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.staffNote !== undefined) row.staffNote = dto.staffNote.trim();
    return this.toClient(await this.requests.save(row));
  }

  async remove(id: string) {
    const row = await this.requests.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Demande introuvable');
    await this.requests.remove(row);
    return { ok: true };
  }

  async stats() {
    const rows = await this.requests.find();
    return {
      total: rows.length,
      nouveau: rows.filter((row) => row.status === 'nouveau').length,
      enCours: rows.filter(
        (row) => row.status === 'rappele' || row.status === 'negociation',
      ).length,
      conclu: rows.filter((row) => row.status === 'conclu').length,
    };
  }

  private async nextId() {
    for (let i = 0; i < 8; i++) {
      const id = `GRS-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!(await this.requests.exists({ where: { id } }))) return id;
    }
    return `GRS-${Date.now().toString().slice(-4)}`;
  }

  private toClient(row: WholesaleRequest) {
    return {
      id: row.id,
      createdAt: row.createdAt,
      company: row.company,
      contactName: row.contactName,
      phone: row.phone,
      email: row.email || '',
      gouvernorat: row.gouvernorat || '',
      city: row.city || '',
      message: row.message || '',
      items: row.items || [],
      totalQty: row.totalQty,
      retailTotal: Number(row.retailTotal) || 0,
      status: row.status || 'nouveau',
      staffNote: row.staffNote || '',
    };
  }
}
