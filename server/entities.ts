import { EntitySchema } from "typeorm";
import { User } from "./auth/user.entity";
import { WholesaleRequest } from "./wholesale/wholesale-request.entity";
import { Order } from "./orders/order.entity";
import { OrderItem } from "./orders/order-item.entity";
import { ShippingRate } from "./shipping/shipping-rate.entity";
import { Category } from "./products/category.entity";
import { Product } from "./products/product.entity";
import { SiteSettings } from "./site/site-settings.entity";
// Production minifiers rename classes, but TypeORM derives each entity's name and
// query alias from `class.name`. Pin it so persistence does not depend on the bundler.
const named = <T extends abstract new (...args: never[]) => object>(target: T, name: string) =>
  Object.defineProperty(target, "name", { value: name, configurable: true }) as T;
named(User, "User");
named(WholesaleRequest, "WholesaleRequest");
named(Order, "Order");
named(OrderItem, "OrderItem");
named(ShippingRate, "ShippingRate");
named(Category, "Category");
named(Product, "Product");
named(SiteSettings, "SiteSettings");

export const entities = [
  new EntitySchema<User>({
    name: "User",
    tableName: "users",
    columns: {
      id: { type: "varchar", primary: true },
      email: { type: "varchar", unique: true },
      name: { type: "varchar" },
      passwordHash: { type: "varchar" },
      role: { type: "varchar", default: "vendeur" },
      active: { type: "boolean", default: true },
      createdAt: { type: "timestamp", createDate: true, updateDate: false },
    },
    target: User,
  }),
  new EntitySchema<WholesaleRequest>({
    name: "WholesaleRequest",
    tableName: "wholesale_requests",
    columns: {
      id: { type: "varchar", primary: true },
      company: { type: "varchar" },
      contactName: { type: "varchar" },
      phone: { type: "varchar" },
      email: { type: "text", default: "" },
      gouvernorat: { type: "text", default: "" },
      city: { type: "text", default: "" },
      message: { type: "text", default: "" },
      items: { type: "jsonb" },
      totalQty: { type: "int", default: 0 },
      retailTotal: { type: "decimal", precision: 10, scale: 2, default: 0 },
      status: { type: "varchar", default: "nouveau" },
      staffNote: { type: "text", default: "" },
      createdAt: { type: "timestamp", createDate: true, updateDate: false },
    },
    target: WholesaleRequest,
  }),
  new EntitySchema<Order>({
    name: "Order",
    tableName: "orders",
    columns: {
      id: { type: "varchar", primary: true },
      customerName: { type: "varchar" },
      phone: { type: "varchar" },
      gouvernorat: { type: "varchar", default: "" },
      country: { type: "varchar", default: "TN" },
      carrier: { type: "varchar", default: "LA_POSTE" },
      shippingZone: { type: "varchar", default: "TUNISIE" },
      city: { type: "varchar" },
      address: { type: "varchar" },
      notes: { type: "text", default: "" },
      payment: { type: "varchar" },
      paymentPhone: { type: "text", default: "" },
      paymentRef: { type: "text", default: "" },
      paymentStatus: { type: "text", default: "" },
      payUrl: { type: "text", default: "" },
      subtotal: { type: "decimal", precision: 10, scale: 2 },
      delivery: { type: "decimal", precision: 10, scale: 2 },
      total: { type: "decimal", precision: 10, scale: 2 },
      status: { type: "varchar", default: "en_attente" },
      createdAt: { type: "timestamp", createDate: true, updateDate: false },
    },
    relations: {
      items: {
        type: "one-to-many",
        target: () => OrderItem,
        inverseSide: "order",
        cascade: true,
        eager: true,
      },
    },
    target: Order,
  }),
  new EntitySchema<OrderItem>({
    name: "OrderItem",
    tableName: "order_items",
    columns: {
      id: { type: "integer", primary: true, generated: "increment" },
      name: { type: "varchar" },
      image: { type: "varchar" },
      color: { type: "varchar" },
      size: { type: "integer" },
      qty: { type: "integer" },
      price: { type: "decimal", precision: 10, scale: 2 },
      cost: { type: "decimal", precision: 10, scale: 2, default: 0 },
    },
    relations: {
      order: {
        type: "many-to-one",
        target: () => Order,
        inverseSide: "items",
        onDelete: "CASCADE",
      },
      product: {
        type: "many-to-one",
        target: () => Product,
        eager: true,
        nullable: true,
        onDelete: "SET NULL",
      },
    },
    target: OrderItem,
  }),
  new EntitySchema<ShippingRate>({
    name: "ShippingRate",
    tableName: "shipping_rates",
    columns: {
      id: { type: "uuid", primary: true, generated: "uuid" },
      carrier: { type: "varchar" },
      zone: { type: "varchar" },
      isLocal: { type: "boolean", default: false },
      basePriceTND: { type: "decimal", precision: 10, scale: 2 },
      weightIncludedKg: {
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
      },
      pricePerExtraKgTND: {
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
      },
      updatedAt: { type: "timestamp", createDate: false, updateDate: true },
    },
    uniques: [{ columns: ["carrier", "zone"] }],
    target: ShippingRate,
  }),
  new EntitySchema<Category>({
    name: "Category",
    tableName: "categories",
    columns: {
      id: { type: "varchar", primary: true },
      label: { type: "varchar" },
      image: { type: "varchar", default: "" },
    },
    target: Category,
  }),
  new EntitySchema<Product>({
    name: "Product",
    tableName: "products",
    columns: {
      id: { type: "varchar", primary: true },
      name: { type: "varchar" },
      brand: { type: "varchar" },
      price: { type: "decimal", precision: 10, scale: 2 },
      promoPrice: { type: "decimal", precision: 10, scale: 2, default: 0 },
      cost: { type: "decimal", precision: 10, scale: 2, default: 0 },
      description: { type: "text" },
      gender: { type: "varchar" },
      category: { type: "varchar" },
      isNew: { type: "boolean", default: false },
      featured: { type: "boolean", default: false },
      colors: { type: "jsonb" },
      sizes: { type: "jsonb" },
      images: { type: "jsonb" },
      model: { type: "varchar", default: "" },
    },
    target: Product,
  }),
  new EntitySchema<SiteSettings>({
    name: "SiteSettings",
    tableName: "site_settings",
    columns: {
      id: { type: "varchar", primary: true },
      heroKicker: { type: "varchar", default: "" },
      heroTitle: { type: "varchar", default: "" },
      heroSubtitle: { type: "varchar", default: "" },
      coverImages: { type: "jsonb" },
    },
    target: SiteSettings,
  }),
];
