"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchCategories, fetchProducts } from "./api";
import { withColorImages } from "./product-media";
import {
  categories as fallbackCategories,
  fallbackProducts,
  type Product,
  type ShopCategory,
} from "./products";

type CatalogValue = {
  products: Product[];
  categories: ShopCategory[];
  ready: boolean;
  error: string | null;
  refresh: () => void;
};

const CatalogContext = createContext<CatalogValue>({
  products: fallbackProducts,
  categories: fallbackCategories,
  ready: false,
  error: null,
  refresh: () => {},
});

function mapCategories(rows: unknown): ShopCategory[] {
  if (!Array.isArray(rows) || rows.length === 0) return fallbackCategories;
  return rows.map((row: { id?: string; slug?: string; label: string; image?: string }) => ({
    slug: row.slug || row.id || "",
    label: row.label,
    image: row.image || "",
  }));
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<ShopCategory[]>(fallbackCategories);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchProducts(), fetchCategories()]).then(([p, c]) => {
      if (cancelled) return;
      if (p.status === "fulfilled" && Array.isArray(p.value) && p.value.length) {
        setProducts(p.value.map((item) => withColorImages(item as Product)));
      } else {
        setError("API indisponible — catalogue local");
      }
      if (c.status === "fulfilled") setCategories(mapCategories(c.value));
      setReady(true);
    });
    const failSafe = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 9000);
    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
    };
  }, [tick]);

  const value = useMemo(
    () => ({ products, categories, ready, error, refresh }),
    [products, categories, ready, error, refresh],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}

export function useProduct(id: string) {
  const { products, ready } = useCatalog();
  return {
    product: products.find((p) => p.id === id),
    ready,
  };
}
