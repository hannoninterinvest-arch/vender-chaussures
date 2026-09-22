"use client";

import { useEffect, useState } from "react";
import { resolveExistingGlb } from "@/lib/product-models";

export function useExistingGlb(product?: { id: string; model?: string | null } | null) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    setSrc("");
    void resolveExistingGlb(product).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.model]);

  return src;
}
