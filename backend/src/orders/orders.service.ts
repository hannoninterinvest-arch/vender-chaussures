import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
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
      const product = await this.products.findOne(line.productId);
      if (!product) {
        throw new BadRequestException(`Produit inconnu: ${line.productId}`);
      }
      if (!product.sizes.includes(line.size)) {
        throw new BadRequestException(`Pointure indisponible pour ${product.name}`);
      }
      const price = Number(product.price);
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
      subtotal,
      delivery,
      total: subtotal + delivery,
      items: lines,
    });

    return this.orders.save(order);
  }

  async findOne(id: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    return this.toClient(order);
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
