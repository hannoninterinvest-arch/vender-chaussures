"use client";

import { useEffect, useRef } from "react";
import { variantForColor } from "@/lib/product-models";

type ViewerEl = HTMLElement & { variantName?: string };

export function ProductModel({
  src,
  poster,
  alt,
  colorName,
}: {
  src: string;
  poster?: string;
  alt: string;
  colorName?: string;
}) {
  const ref = useRef<ViewerEl>(null);

  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      el.variantName = variantForColor(colorName);
    };
    el.addEventListener("load", apply);
    apply();
    return () => el.removeEventListener("load", apply);
  }, [colorName, src]);

  return (
    <div className="product-model-stage">
      <model-viewer
        ref={ref}
        className="product-model"
        src={src}
        poster={poster}
        alt={alt}
        camera-controls
        auto-rotate
        shadow-intensity="1.15"
        exposure="1.05"
        environment-image="neutral"
        touch-action="pan-y"
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-orbit="55deg 75deg 1.7m"
        field-of-view="28deg"
        min-camera-orbit="auto auto 1.15m"
        max-camera-orbit="auto auto 3.2m"
      />
      <p className="product-model-hint">Glisse pour tourner · pince pour zoomer</p>
      <span className="sr-only">Aperçu 3D au format glTF (.glb)</span>
    </div>
  );
}
