import { OrderAccessService } from "./order-access.service";
import { ConfigService } from "../config";
import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@/server/http";
import { CommerceStore } from "../commerce-store";
import {
  allowedStatuses,
  effectiveStatus,
  refundRequired,
} from "@/lib/order-workflow";
import type { AuthUser } from "../auth/auth.types";
import type { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { Repository, type EntityManager } from "typeorm";
import { FlouciService } from "../payments/flouci.service";
import { roundMoney } from "../shipping/shipping-quote";
import { KonnectService } from "../payments/konnect.service";
import { sellingPrice } from "../products/pricing";
import { ProductsService } from "../products/products.service";
import { PAIR_WEIGHT_KG, isTunisia } from "../shipping/shipping-rates.config";
import { ShippingService } from "../shipping/shipping.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderStatus } from "./dto/update-order-status.dto";
import { OrderItem } from "./order-item.entity";
import { Order } from "./order.entity";

export class OrdersService {
  constructor(
    private readonly orders: Repository<Order>,
    private readonly items: Repository<OrderItem>,
    private readonly products: ProductsService,
    private readonly konnect: KonnectService,
    private readonly shipping: ShippingService,
    private readonly flouci: FlouciService,
    private readonly store?: CommerceStore,
    private readonly access = new OrderAccessService(new ConfigService()),
  ) {}

  frontendUrl() {
    return this.konnect.frontendUrl();
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
        throw new BadRequestException(
          `Pointure indisponible pour ${product.name}`,
        );
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

    const country = dto.country || "TN";
    const carrier = dto.carrier || "LA_POSTE";
    if (dto.payment === "cod" && !isTunisia(country)) {
      throw new BadRequestException(
        "Le paiement à la livraison n’est disponible qu’en Tunisie.",
      );
    }
    const weightKg = lines.reduce(
      (sum, line) => sum + PAIR_WEIGHT_KG * line.qty,
      0,
    );
    const quote = await this.shipping.quote(country, carrier, weightKg);
    const delivery = quote.price;
    const total = roundMoney(subtotal + delivery);
    if (
      dto.expectedTotal !== undefined &&
      roundMoney(dto.expectedTotal) !== total
    ) {
      throw new BadRequestException(
        "Le prix ou les frais de livraison ont changé. Actualise le panier avant de confirmer.",
      );
    }
    const online = dto.payment !== "cod";
    const gateway = dto.payment === "flouci" ? this.flouci : this.konnect;
    if (online && !gateway.configured()) {
      throw new BadRequestException(
        "Ce moyen de paiement est indisponible. Choisis un autre moyen de paiement.",
      );
    }
    const order = this.orders.create({
      id: await this.nextId(),
      customerName: dto.customerName,
      phone: dto.phone,
      gouvernorat: dto.gouvernorat ?? "",
      country: quote.country,
      carrier,
      shippingZone: quote.zone,
      city: dto.city,
      address: [
        dto.address,
        dto.postalCode?.trim(),
        dto.stateProvinceCode?.trim(),
      ]
        .filter(Boolean)
        .join(", "),
      notes: dto.notes ?? "",
      payment: dto.payment,
      paymentPhone: "",
      paymentRef: "",
      paymentStatus: online ? "pending" : "cod",
      payUrl: "",
      status: online ? "paiement_en_cours" : "en_attente",
      subtotal: roundMoney(subtotal),
      delivery,
      total,
      items: lines,
    });

    const saved = this.store
      ? await this.orders.manager.transaction(async (manager) => {
          const row = await manager.getRepository(Order).save(order);
          await this.event(
            manager,
            row,
            "creation",
            "system",
            "Commande enregistrée",
            "",
            row.status,
          );
          return row;
        })
      : await this.orders.save(order);
    if (!online) return saved;

    try {
      const payment = await gateway.initPayment({
        orderId: saved.id,
        accessToken: this.access.token(saved.id),
        amountTnd: Number(saved.total),
        customerName: saved.customerName,
        phone: saved.phone,
      });
      saved.paymentRef = payment.paymentRef;
      saved.payUrl = payment.payUrl;
      await this.orders.update(
        { id: saved.id },
        { paymentRef: saved.paymentRef, payUrl: saved.payUrl },
      );
      return saved;
    } catch {
      await this.orders.update(
        { id: saved.id, paymentStatus: "pending" },
        { paymentStatus: "failed" },
      );
      saved.paymentStatus = "failed";
      return saved;
    }
  }

  async retryPayment(id: string) {
    let order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException("Commande introuvable");
    if (order.payment === "cod") {
      throw new BadRequestException("Cette commande se règle à la livraison");
    }
    order = await this.syncPayment(order);
    if (order.paymentStatus === "paid") {
      throw new BadRequestException("Cette commande est déjà payée");
    }
    if (["annulee", "retournee", "livree"].includes(order.status)) {
      throw new BadRequestException("Commande annulée");
    }
    return this.orders.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const current = await repo.findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
        loadEagerRelations: false,
      });
      if (!current) throw new NotFoundException("Commande introuvable");
      if (current.paymentStatus === "paid")
        throw new BadRequestException("Cette commande est déjà payée");
      if (["annulee", "retournee", "livree"].includes(current.status))
        throw new BadRequestException(
          "Cette commande ne peut plus être payée.",
        );
      if (current.paymentStatus === "pending" && current.payUrl)
        return (await repo.findOne({ where: { id } })) ?? current;
      const gateway = current.payment === "flouci" ? this.flouci : this.konnect;
      const payment = await gateway.initPayment({
        orderId: current.id,
        accessToken: this.access.token(current.id),
        amountTnd: Number(current.total),
        customerName: current.customerName,
        phone: current.phone,
      });
      await repo.update(
        { id: current.id },
        {
          paymentRef: payment.paymentRef,
          payUrl: payment.payUrl,
          paymentStatus: "pending",
          status: "paiement_en_cours",
        },
      );
      const from = current.status;
      current.paymentRef = payment.paymentRef;
      current.payUrl = payment.payUrl;
      current.paymentStatus = "pending";
      current.status = "paiement_en_cours";
      await this.event(
        manager,
        current,
        "relance",
        current.payment,
        "Nouveau lien de paiement demandé",
        from,
        current.status,
      );
      return (await repo.findOne({ where: { id } })) ?? current;
    });
  }

  async confirmKonnect(paymentRef: string) {
    if (!paymentRef) return { ok: false, paid: false, orderId: "" };
    const order = await this.orders.findOne({
      where: { paymentRef, payment: "online" },
    });
    if (!order) return { ok: false, paid: false, orderId: "" };
    if (order.paymentStatus === "paid")
      return { ok: true, paid: true, orderId: order.id };
    const payment = await this.konnect.getPayment(paymentRef);

    if (this.konnect.isPaid(payment, order.id, Number(order.total))) {
      const paid = await this.markVerifiedPaid(order, paymentRef);
      return { ok: true, paid, orderId: order.id };
    }
    if (this.konnect.isFailed(payment)) {
      await this.orders.update(
        { id: order.id, paymentRef, paymentStatus: "pending" },
        { paymentStatus: "failed" },
      );
      return { ok: true, paid: false, orderId: order.id };
    }
    return { ok: true, paid: false, orderId: order.id };
  }

  async confirmFlouci(paymentRef: string) {
    if (!paymentRef) return { ok: false, paid: false, orderId: "" };
    const order = await this.orders.findOne({
      where: { paymentRef, payment: "flouci" },
    });
    if (!order) return { ok: false, paid: false, orderId: "" };
    if (order.paymentStatus === "paid")
      return { ok: true, paid: true, orderId: order.id };
    const payment = await this.flouci.getPayment(paymentRef);
    if (this.flouci.isPaid(payment, order.id, Number(order.total))) {
      const paid = await this.markVerifiedPaid(order, paymentRef);
      return { ok: true, paid, orderId: order.id };
    }
    if (this.flouci.isFailed(payment)) {
      await this.orders.update(
        { id: order.id, paymentRef, paymentStatus: "pending" },
        { paymentStatus: "failed" },
      );
    }
    return { ok: true, paid: false, orderId: order.id };
  }

  async syncPayment(order: Order) {
    if (
      order.payment === "cod" ||
      order.paymentStatus === "paid" ||
      !order.paymentRef
    ) {
      return order;
    }
    const result =
      order.payment === "flouci"
        ? await this.confirmFlouci(order.paymentRef)
        : await this.confirmKonnect(order.paymentRef);
    if (!result.ok) return order;
    const fresh = await this.orders.findOne({ where: { id: order.id } });
    return fresh ?? order;
  }

  async findAll() {
    const rows = await this.orders.find({ order: { createdAt: "DESC" } });
    return rows.map((order) => ({ ...this.toClient(order), accessUrl: `${this.frontendUrl()}${this.access.path(order.id)}` }));
  }

  async findOne(id: string) {
    let order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException("Commande introuvable");
    order = await this.syncPayment(order);
    return this.toClient(order);
  }

  private async event(
    manager: EntityManager,
    order: Order,
    type: string,
    actor: string,
    reason: string,
    from: string,
    to: string,
  ) {
    if (!this.store) return;
    const at = new Date().toISOString();
    await this.store.put(
      `order-event:${order.id}:${at}:${randomUUID()}`,
      { type, actor, reason, from, to, at, paymentStatus: order.paymentStatus },
      manager,
    );
  }

  private async markVerifiedPaid(order: Order, paymentRef: string) {
    return this.orders.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const current = await repo.findOne({
        where: { id: order.id, paymentRef },
        lock: { mode: "pessimistic_write" },
        loadEagerRelations: false,
      });
      if (!current) return false;
      if (current.paymentStatus === "paid") return true;
      const from = current.status;
      const status = ["paiement_en_cours", "en_attente"].includes(
        current.status,
      )
        ? "confirmee"
        : current.status;
      await repo.update(
        { id: current.id, paymentRef, paymentStatus: current.paymentStatus },
        { paymentStatus: "paid", status },
      );
      current.paymentStatus = "paid";
      current.status = status;
      await this.event(
        manager,
        current,
        "paiement",
        current.payment,
        "Paiement vérifié auprès du prestataire",
        from,
        status,
      );
      return true;
    });
  }

  async history(id: string) {
    const exists = await this.orders.exists({ where: { id } });
    if (!exists) throw new NotFoundException("Commande introuvable");
    return this.store ? this.store.list(`order-event:${id}:`) : [];
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    options: Partial<UpdateOrderStatusDto> = {},
    actor?: AuthUser,
  ) {
    return this.orders.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const order = await repo.findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
        loadEagerRelations: false,
      });
      if (!order) throw new NotFoundException("Commande introuvable");
      if (
        order.payment !== "cod" &&
        order.paymentStatus !== "paid" &&
        ["confirmee", "en_livraison", "livree"].includes(status)
      )
        throw new BadRequestException(
          "Le paiement en ligne n’est pas encore confirmé.",
        );
      const current = effectiveStatus(order);
      const cashOnly =
        current === "livree" &&
        status === "livree" &&
        order.payment === "cod" &&
        order.paymentStatus !== "paid" &&
        options.cashReceived === true;
      if (!cashOnly && !allowedStatuses(order).includes(status))
        throw new BadRequestException(
          "Ce changement de statut n’est pas autorisé.",
        );
      if (
        order.payment === "cod" &&
        status === "confirmee" &&
        options.callConfirmed !== true
      )
        throw new BadRequestException(
          "Confirmez que le client a accepté la commande lors de votre appel.",
        );
      if (
        order.payment === "cod" &&
        status === "livree" &&
        options.cashReceived !== true
      )
        throw new BadRequestException(
          "Confirmez la réception réelle du paiement à la livraison.",
        );
      if (order.payment !== "cod" && options.cashReceived)
        throw new BadRequestException(
          "Un paiement en ligne doit être vérifié par le prestataire.",
        );
      if (["annulee", "retournee"].includes(status) && !options.reason?.trim())
        throw new BadRequestException(
          "Précisez le motif de l’annulation ou du retour.",
        );
      const paymentStatus =
        order.payment === "cod" && status === "livree"
          ? "paid"
          : order.paymentStatus;
      const result = await repo.update(
        { id, status: order.status, paymentStatus: order.paymentStatus },
        { status, paymentStatus },
      );
      if (result.affected !== 1)
        throw new ConflictException(
          "La commande a changé. Actualisez avant de réessayer.",
        );
      order.status = status;
      order.paymentStatus = paymentStatus;
      await this.event(
        manager,
        order,
        "statut",
        actor?.name || actor?.id || "staff",
        options.reason?.trim() ||
          (status === "confirmee"
            ? "Client confirmé par téléphone"
            : status === "livree"
              ? "Livraison et encaissement confirmés"
              : "Statut mis à jour"),
        current,
        status,
      );
      return this.toClient((await repo.findOne({ where: { id } })) ?? order);
    });
  }

  async stats() {
    const rows = await this.orders.find({ order: { createdAt: "DESC" } });
    const delivered = rows.filter(
      (o) => o.status === "livree" && o.paymentStatus === "paid",
    );
    const pending = rows.filter(
      (o) =>
        o.status === "en_attente" ||
        o.status === "confirmee" ||
        o.status === "en_livraison" ||
        o.status === "paiement_en_cours",
    );
    const cancelled = rows.filter((o) => o.status === "annulee");

    let revenue = 0;
    let cost = 0;
    const byProduct = new Map<
      string,
      {
        productId: string;
        name: string;
        image: string;
        qty: number;
        revenue: number;
        profit: number;
      }
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
      returned: rows.filter((o) => o.status === "retournee").length,
      confirmed: rows.filter((o) => effectiveStatus(o) === "confirmee").length,
      awaitingCall: rows.filter(
        (o) => o.payment === "cod" && o.status === "en_attente",
      ).length,
      awaitingPayment: rows.filter(
        (o) =>
          o.payment !== "cod" &&
          o.paymentStatus !== "paid" &&
          o.status !== "annulee",
      ).length,
      revenue,
      cost,
      profit: revenue - cost,
      bestProduct: ranking[0] ?? null,
      topProducts: ranking.slice(0, 5),
    };
  }

  private async nextId() {
    return `KCK-${randomUUID()}`;
  }

  toClient(order: Order) {
    return {
      id: order.id,
      createdAt: order.createdAt,
      status: effectiveStatus(order) || "en_attente",
      allowedStatuses: allowedStatuses(order),
      refundRequired: refundRequired(order),
      subtotal: Number(order.subtotal),
      delivery: Number(order.delivery),
      total: Number(order.total),
      payment: order.payment,
      paymentPhone: order.paymentPhone || "",
      paymentStatus:
        order.paymentStatus || (order.payment === "cod" ? "cod" : "pending"),
      payUrl: order.payUrl || "",
      customer: {
        name: order.customerName,
        phone: order.phone,
        gouvernorat: order.gouvernorat,
        country: order.country || "TN",
        city: order.city,
        address: order.address,
        notes: order.notes,
      },
      carrier: order.carrier || "LA_POSTE",
      shippingZone: order.shippingZone || "TUNISIE",
      items: order.items.map((item) => ({
        productId: item.product?.id ?? "",
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
