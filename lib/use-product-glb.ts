"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColorOption } from "@/lib/product-media";
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
    // Clear the previous color before the next GLB lookup finishes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the lookup is async and must not keep the old model
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
