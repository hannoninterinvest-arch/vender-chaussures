import type { Gouvernorat, PaymentMethod } from "./tunisia";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  size: number;
  color: string;
  qty: number;
  price: number;
};

export type GuestOrder = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  payment: PaymentMethod;
  customer: {
    name: string;
    phone: string;
    gouvernorat: Gouvernorat;
    city: string;
    address: string;
    notes?: string;
  };
};

const KEY = "kicks-orders";
const listeners = new Set<() => void>();
let orders: GuestOrder[] = [];
let loaded = false;

function emit() {
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    orders = raw ? (JSON.parse(raw) as GuestOrder[]) : [];
  } catch {
    orders = [];
  }
}

if (typeof window !== "undefined") load();

export function subscribeOrders(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function createOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `KCK-${n}`;
}

export function saveOrder(order: GuestOrder) {
  load();
  orders = [order, ...orders.filter((o) => o.id !== order.id)];
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(orders));
  }
  emit();
}

export function listOrders(): GuestOrder[] {
  load();
  return orders;
}

export function getOrder(id: string) {
  load();
  return orders.find((o) => o.id === id);
}
