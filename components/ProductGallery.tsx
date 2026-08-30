"use client";

import { useMemo, useState } from "react";
import { galleryForColor } from "@/lib/product-media";
import { videoPoster } from "@/lib/media";
import type { Product } from "@/lib/products";
import { ProductSpin3D } from "./ProductSpin3D";
import { ProductVideo } from "./ProductVideo";

type GalleryItem =
  | { kind: "spin"; src: string }
  | { kind: "video"; src: string }
  | { kind: "image"; src: string };

export function ProductGallery({
  product,
  color,
}: {
  product: Product;
  color: string;
}) {
  const photos = galleryForColor(product, color);
  const items = useMemo<GalleryItem[]>(() => {
    const primary = photos[0] || product.images[0] || "";
    const list: GalleryItem[] = [];
    if (product.video) list.push({ kind: "video", src: product.video });
    else if (primary) list.push({ kind: "spin", src: primary });
    for (const src of photos) list.push({ kind: "image", src });
    return list;
  }, [photos, product.video, product.images]);

  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });
  const current = items[index] || items[0];

  function select(i: number) {
    setIndex(i);
    setZoom((z) => ({ ...z, on: false }));
  }

  return (
    <div className="product-gallery">
      <div className="gold-frame relative overflow-hidden rounded-[4px] bg-[var(--panel)]">
        {current?.kind === "video" ? (
          <ProductVideo
            src={current.src}
            poster={videoPoster(current.src, photos[0])}
            className="aspect-square w-full"
            autoPlay
            controls
            label="Vue 3D"
          />
        ) : current?.kind === "spin" ? (
          <ProductSpin3D src={current.src} alt={product.name} className="aspect-square w-full" />
        ) : (
          <div
            className="product-zoom aspect-square w-full cursor-zoom-in"
            onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
            onMouseMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - box.left) / box.width) * 100;
              const y = ((e.clientY - box.top) / box.height) * 100;
              setZoom({ x, y, on: true });
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current?.src}
              alt={product.name}
              className="h-full w-full object-cover"
              style={
                zoom.on
                  ? {
                      transform: "scale(1.85)",
                      transformOrigin: `${zoom.x}% ${zoom.y}%`,
                    }
                  : undefined
              }
            />
          </div>
        )}
        {current?.kind === "image" ? (
          <p className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-black/55 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-[#F3EDE2]">
            Zoom
          </p>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {items.map((item, i) => {
            const active = i === index;
            const thumb =
              item.kind === "video" ? videoPoster(item.src, photos[0]) : item.src;
            const label = item.kind === "video" || item.kind === "spin" ? "Vue 3D" : `Photo ${i + 1}`;
            return (
              <button
                key={`${item.kind}-${item.src}-${i}`}
                type="button"
                onClick={() => select(i)}
                aria-label={label}
                className={`relative overflow-hidden rounded-sm ${
                  active ? "gold-frame" : "opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt="" className="aspect-square w-full object-cover" />
                {item.kind === "video" || item.kind === "spin" ? (
                  <span className="badge-3d absolute inset-x-1 bottom-1 text-center">3D</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
