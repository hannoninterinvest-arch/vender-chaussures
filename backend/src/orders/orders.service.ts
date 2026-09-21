import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlouciService } from '../payments/flouci.service';
import { sellingPrice } from '../products/pricing';
import { ProductsService } from '../products/products.service';
import { PAIR_WEIGHT_KG, isTunisia } from '../shipping/shipping-rates.config';
import { ShippingService } from '../shipping/shipping.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly items: Repository<OrderItem>,
    private readonly products: ProductsService,
    private readonly flouci: FlouciService,
    private readonly shipping: ShippingService,
  ) {}

  frontendUrl() {
    return this.flouci.frontendUrl();
  }

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
      const price = sellingPrice(product);
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

    const country = dto.country || 'TN';
    const carrier = dto.carrier || 'LA_POSTE';
    if (dto.payment === 'cod' && !isTunisia(country)) {
      throw new BadRequestException(
        'Le paiement à la livraison n’est disponible qu’en Tunisie.',
      );
    }
    const weightKg = lines.reduce((sum, line) => sum + PAIR_WEIGHT_KG * line.qty, 0);
    const quote = await this.shipping.quote(country, carrier, weightKg);
    const delivery = quote.price;
    const online = dto.payment === 'online';
    if (online && !this.flouci.configured()) {
      throw new BadRequestException(
        'Paiement en ligne indisponible. Choisis le paiement à la livraison (Tunisie uniquement).',
      );
    }
    const order = this.orders.create({
      id: await this.nextId(),
      customerName: dto.customerName,
      phone: dto.phone,
      gouvernorat: dto.gouvernorat ?? '',
      country: quote.country,
      carrier,
      shippingZone: quote.zone,
      city: dto.city,
      address: dto.address,
      notes: dto.notes ?? '',
      payment: dto.payment,
      paymentPhone: '',
      paymentRef: '',
      paymentStatus: online ? 'pending' : 'cod',
      payUrl: '',
      status: online ? 'paiement_en_cours' : 'en_attente',
      subtotal,
      delivery,
      total: subtotal + delivery,
      items: lines,
    });

    const saved = await this.orders.save(order);
    if (!online) return saved;

    try {
      const payment = await this.flouci.initPayment({
        orderId: saved.id,
        amountTnd: Number(saved.total),
        customerName: saved.customerName,
        phone: saved.phone,
      });
      saved.paymentRef = payment.paymentRef;
      saved.payUrl = payment.payUrl;
      return this.orders.save(saved);
    } catch (err) {
      await this.orders.remove(saved);
      throw err;
    }
  }

  async retryPayment(id: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.payment !== 'online') {
      throw new BadRequestException('Cette commande se règle à la livraison');
    }
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Cette commande est déjà payée');
    }
    if (order.status === 'annulee') {
      throw new BadRequestException('Commande annulée');
    }
    const payment = await this.flouci.initPayment({
      orderId: order.id,
      amountTnd: Number(order.total),
      customerName: order.customerName,
      phone: order.phone,
    });
    order.paymentRef = payment.paymentRef;
    order.payUrl = payment.payUrl;
    order.paymentStatus = 'pending';
    order.status = 'paiement_en_cours';
    return this.orders.save(order);
  }

  async confirmOnline(paymentRef: string) {
    if (!paymentRef) return { ok: false, paid: false, orderId: '' };
    const payment = await this.flouci.getPayment(paymentRef);
    let order = await this.orders.findOne({ where: { paymentRef } });
    if (!order && payment?.orderId) {
      order = await this.orders.findOne({ where: { id: payment.orderId } });
    }
    if (!order) return { ok: false, paid: false, orderId: '' };

    if (this.flouci.isPaid(payment)) {
      order.paymentStatus = 'paid';
      if (order.status === 'paiement_en_cours') order.status = 'en_attente';
      await this.orders.save(order);
      return { ok: true, paid: true, orderId: order.id };
    }
    if (this.flouci.isFailed(payment)) {
      order.paymentStatus = 'failed';
      await this.orders.save(order);
      return { ok: true, paid: false, orderId: order.id };
    }
    return { ok: true, paid: false, orderId: order.id };
  }

  async syncPayment(order: Order) {
    if (order.payment !== 'online' || order.paymentStatus === 'paid' || !order.paymentRef) {
      return order;
    }
    const result = await this.confirmOnline(order.paymentRef);
    if (!result.ok) return order;
    const fresh = await this.orders.findOne({ where: { id: order.id } });
    return fresh ?? order;
  }

  async findAll() {
    const rows = await this.orders.find({ order: { createdAt: 'DESC' } });
    return rows.map((order) => this.toClient(order));
  }

  async findOne(id: string) {
    let order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    order = await this.syncPayment(order);
    return this.toClient(order);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (
      (status === 'en_livraison' || status === 'livree') &&
      order.payment === 'online' &&
      order.paymentStatus !== 'paid'
    ) {
      throw new BadRequestException('Le paiement en ligne n’est pas encore confirmé.');
    }
    order.status = status;
    return this.toClient(await this.orders.save(order));
  }

  async stats() {
    const rows = await this.orders.find({ order: { createdAt: 'DESC' } });
    const delivered = rows.filter((o) => o.status === 'livree');
    const pending = rows.filter(
      (o) =>
        o.status === 'en_attente' ||
        o.status === 'en_livraison' ||
        o.status === 'paiement_en_cours',
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
      paymentPhone: order.paymentPhone || '',
      paymentStatus: order.paymentStatus || (order.payment === 'cod' ? 'cod' : 'pending'),
      payUrl: order.payUrl || '',
      customer: {
        name: order.customerName,
        phone: order.phone,
        gouvernorat: order.gouvernorat,
        country: order.country || 'TN',
        city: order.city,
        address: order.address,
        notes: order.notes,
      },
      carrier: order.carrier || 'LA_POSTE',
      shippingZone: order.shippingZone || 'TUNISIE',
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
