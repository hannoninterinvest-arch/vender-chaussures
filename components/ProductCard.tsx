import Link from "next/link";
import { formatTnd } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <div className="gold-frame relative overflow-hidden rounded-[4px] bg-[var(--panel)]">
        {product.isNew && (
          <span className="absolute left-3 top-3 z-10 rounded-sm bg-[#C5A059] px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-[#1A1A1B]">
            New
          </span>
        )}
        <Link href={`/products/${product.id}`} className="block aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </Link>
      </div>
      <h3 className="mt-3 text-[13px] font-semibold tracking-[0.14em] uppercase text-[var(--fg)]">
        {product.name}
      </h3>
      <Link
        href={`/products/${product.id}`}
        className="gold-btn mt-3 flex w-full items-center justify-center gap-2 rounded-sm px-3 py-3.5 text-xs uppercase"
      >
        Voir — <span>{formatTnd(product.price)}</span>
      </Link>
    </article>
  );
}
