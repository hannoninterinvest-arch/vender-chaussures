"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColorOption } from "@/lib/products";
import { resolveExistingGlb } from "@/lib/product-models";

export function useExistingGlb(
  product?: { id: string; model?: string | null; colors?: ColorOption[] } | null,
  colorName?: string | null,
) {
  const [src, setSrc] = useState("");
  const colorKey = useMemo(
    () => (product?.colors || []).map((c) => `${c.name}:${c.model || ""}`).join("|"),
    [product?.colors],
  );

  useEffect(() => {
    let cancelled = false;
    setSrc("");
    void resolveExistingGlb(product, colorName).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [product, product?.id, product?.model, colorName, colorKey]);

  return src;
}
