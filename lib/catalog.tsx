"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchProducts } from "./api";
import {
  fallbackProducts,
  type Product,
} from "./products";

type CatalogValue = {
  products: Product[];
  ready: boolean;
  error: string | null;
};

const CatalogContext = createContext<CatalogValue>({
  products: fallbackProducts,
  ready: false,
  error: null,
});

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((rows: Product[]) => {
        if (Array.isArray(rows) && rows.length) setProducts(rows);
      })
      .catch(() => setError("API indisponible — catalogue local"))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({ products, ready, error }),
    [products, ready, error],
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
