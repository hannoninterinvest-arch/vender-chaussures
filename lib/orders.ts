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

export function createOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `KCK-${n}`;
}

export function saveOrder(order: GuestOrder) {
  if (typeof window === "undefined") return;
  const all = listOrders();
  localStorage.setItem(KEY, JSON.stringify([order, ...all]));
}

export function listOrders(): GuestOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GuestOrder[]) : [];
  } catch {
    return [];
  }
}

export function getOrder(id: string) {
  return listOrders().find((o) => o.id === id);
}
