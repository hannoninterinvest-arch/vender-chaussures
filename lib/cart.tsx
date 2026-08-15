"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type CartLine = {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: number;
  color: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (line: Pick<CartLine, "productId" | "size" | "color">, qty: number) => void;
  remove: (line: Pick<CartLine, "productId" | "size" | "color">) => void;
  clear: () => void;
};

const KEY = "kicks-cart";

function same(
  a: Pick<CartLine, "productId" | "size" | "color">,
  b: Pick<CartLine, "productId" | "size" | "color">,
) {
  return (
    a.productId === b.productId && a.size === b.size && a.color === b.color
  );
}

let lines: CartLine[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(lines));
  emit();
}

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    lines = raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    lines = [];
  }
}

if (typeof window !== "undefined") load();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return lines;
}

const EMPTY: CartLine[] = [];

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function useCart(): CartContextValue {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((line: Omit<CartLine, "qty"> & { qty?: number }) => {
    const qty = line.qty ?? 1;
    const i = lines.findIndex((l) => same(l, line));
    if (i === -1) lines = [...lines, { ...line, qty }];
    else
      lines = lines.map((l, idx) =>
        idx === i ? { ...l, qty: l.qty + qty } : l,
      );
    persist();
  }, []);

  const setQty = useCallback(
    (line: Pick<CartLine, "productId" | "size" | "color">, qty: number) => {
      lines =
        qty <= 0
          ? lines.filter((l) => !same(l, line))
          : lines.map((l) => (same(l, line) ? { ...l, qty } : l));
      persist();
    },
    [],
  );

  const remove = useCallback(
    (line: Pick<CartLine, "productId" | "size" | "color">) => {
      lines = lines.filter((l) => !same(l, line));
      persist();
    },
    [],
  );

  const clear = useCallback(() => {
    lines = [];
    persist();
  }, []);

  return useMemo(() => {
    const count = current.reduce((s, l) => s + l.qty, 0);
    const subtotal = current.reduce((s, l) => s + Number(l.price || 0) * l.qty, 0);
    return { lines: current, count, subtotal, add, setQty, remove, clear };
  }, [current, add, setQty, remove, clear]);
}
