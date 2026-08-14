import Link from "next/link";
import { formatTnd } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[16px] bg-[#C4C4C4]/40">
        {product.isNew && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-[#5B6AF6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            New
          </span>
        )}
        <Link href={`/products/${product.id}`} className="block aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        </Link>
      </div>
      <h3 className="mt-3 text-[16px] font-bold uppercase tracking-wide text-[#1A1A1A]">
        {product.name}
      </h3>
      <Link
        href={`/products/${product.id}`}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D2D2D] px-3 py-3.5 text-sm font-medium text-white transition hover:bg-[#1A1A1A]"
      >
        Voir le produit —{" "}
        <span className="font-bold text-[#FFB800]">{formatTnd(product.price)}</span>
      </Link>
    </article>
  );
}
