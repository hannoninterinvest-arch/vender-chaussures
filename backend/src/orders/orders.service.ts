import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

const GRAND_TUNIS = ['Tunis', 'Ariana', 'Ben Arous', 'Manouba'];
const SAHEL = ['Sousse', 'Monastir', 'Mahdia', 'Nabeul'];

function deliveryFee(gouvernorat: string) {
  if (GRAND_TUNIS.includes(gouvernorat)) return 8;
  if (SAHEL.includes(gouvernorat) || gouvernorat === 'Sfax') return 12;
  return 15;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly items: Repository<OrderItem>,
    private readonly products: ProductsService,
  ) {}

  async create(dto: CreateOrderDto) {
    const lines: OrderItem[] = [];
    let subtotal = 0;

    for (const line of dto.items) {
      const product = await this.products.getEntity(line.productId);
      if (!product) {
        throw new BadRequestException(`Produit inconnu: ${line.productId}`);
      }
      if (!product.sizes.includes(line.size)) {
        throw new BadRequestException(`Pointure indisponible pour ${product.name}`);
      }
      const price = Number(product.price);
      const cost = Number(product.cost) || 0;
      subtotal += price * line.qty;
      lines.push(
        this.items.create({
          product,
          name: product.name,
          image: product.images[0],
          color: line.color,
          size: line.size,
          qty: line.qty,
          price,
          cost,
        }),
      );
    }

    const delivery = deliveryFee(dto.gouvernorat);
    const order = this.orders.create({
      id: await this.nextId(),
      customerName: dto.customerName,
      phone: dto.phone,
      gouvernorat: dto.gouvernorat,
      city: dto.city,
      address: dto.address,
      notes: dto.notes ?? '',
      payment: dto.payment,
      status: 'en_attente',
      subtotal,
      delivery,
      total: subtotal + delivery,
      items: lines,
    });

    return this.orders.save(order);
  }

  async findAll() {
    const rows = await this.orders.find({ order: { createdAt: 'DESC' } });
    return rows.map((order) => this.toClient(order));
  }

  async findOne(id: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    return this.toClient(order);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order.status = status;
    return this.toClient(await this.orders.save(order));
  }

  async stats() {
    const rows = await this.orders.find({ order: { createdAt: 'DESC' } });
    const delivered = rows.filter((o) => o.status === 'livree');
    const pending = rows.filter(
      (o) => o.status === 'en_attente' || o.status === 'en_livraison',
    );
    const cancelled = rows.filter((o) => o.status === 'annulee');

    let revenue = 0;
    let cost = 0;
    const byProduct = new Map<
      string,
      { productId: string; name: string; image: string; qty: number; revenue: number; profit: number }
    >();

    for (const order of delivered) {
      revenue += Number(order.subtotal);
      for (const item of order.items) {
        const qty = item.qty;
        const lineRev = Number(item.price) * qty;
        const lineCost = (Number(item.cost) || 0) * qty;
        cost += lineCost;
        const productId = item.product?.id || item.name;
        const prev = byProduct.get(productId) || {
          productId,
          name: item.name,
          image: item.image,
          qty: 0,
          revenue: 0,
          profit: 0,
        };
        prev.qty += qty;
        prev.revenue += lineRev;
        prev.profit += lineRev - lineCost;
        byProduct.set(productId, prev);
      }
    }

    const ranking = [...byProduct.values()].sort(
      (a, b) => b.qty - a.qty || b.revenue - a.revenue,
    );

    return {
      orders: rows.length,
      pending: pending.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      revenue,
      cost,
      profit: revenue - cost,
      bestProduct: ranking[0] ?? null,
      topProducts: ranking.slice(0, 5),
    };
  }

  private async nextId() {
    for (let i = 0; i < 8; i++) {
      const id = `KCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const exists = await this.orders.exists({ where: { id } });
      if (!exists) return id;
    }
    return `KCK-${Date.now().toString().slice(-4)}`;
  }

  toClient(order: Order) {
    return {
      id: order.id,
      createdAt: order.createdAt,
      status: order.status || 'en_attente',
      subtotal: Number(order.subtotal),
      delivery: Number(order.delivery),
      total: Number(order.total),
      payment: order.payment,
      customer: {
        name: order.customerName,
        phone: order.phone,
        gouvernorat: order.gouvernorat,
        city: order.city,
        address: order.address,
        notes: order.notes,
      },
      items: order.items.map((item) => ({
        productId: item.product?.id ?? '',
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        qty: item.qty,
        price: Number(item.price),
      })),
    };
  }
}
