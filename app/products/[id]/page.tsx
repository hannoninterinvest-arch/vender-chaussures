"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { relatedProducts } from "@/lib/products";
import { useCatalog, useProduct } from "@/lib/catalog";
import { formatTnd } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import { ProductCard } from "@/components/ProductCard";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products, ready } = useCatalog();
  const { product } = useProduct(id);
  const cart = useCart();
  const toast = useToast();
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);

  if (!ready) {
    return <p className="px-6 py-20 text-center text-sm text-[#666]">Chargement…</p>;
  }
  if (!product) notFound();

  const selectedColor = color ?? product.colors[0]?.name ?? "";

  const snapshot = {
    productId: product.id,
    name: product.name,
    image: product.images[0],
    price: Number(product.price),
    size: size ?? 0,
    color: selectedColor,
  };

  function add() {
    if (!size) {
      toast("Choisis une pointure.");
      return;
    }
    cart.add({ ...snapshot, size });
    toast("Ajouté au panier.");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
      <p className="mb-6 text-sm text-[#666]">
        <Link href="/shop">Boutique</Link> / {product.brand} / {product.name}
      </p>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[photo]}
            alt={product.name}
            className="aspect-square w-full rounded-[16px] object-cover"
          />
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(i)}
                className={`overflow-hidden rounded-xl ${photo === i ? "ring-2 ring-[#5B6AF6]" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          {product.isNew && (
            <span className="inline-block rounded-md bg-[#5B6AF6] px-2.5 py-1 text-[11px] font-bold uppercase text-white">
              New release
            </span>
          )}
          <h1 className="mt-3 text-3xl font-black md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold text-[#5B6AF6]">{formatTnd(product.price)}</p>

          <div className="mt-8">
            <p className="text-sm font-bold">COULEUR</p>
            <div className="mt-3 flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => setColor(c.name)}
                  className={`h-11 w-11 rounded-full border-2 ${
                    selectedColor === c.name ? "border-[#1A1A1A]" : "border-transparent"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold">
              <span>POINTURE EU</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-12 w-12 rounded-lg text-sm font-medium ${
                    size === s
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white text-[#1A1A1A]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={add}
              className="h-12 w-full rounded-lg bg-[#1A1A1A] text-sm font-semibold text-white"
            >
              AJOUTER AU PANIER
            </button>
            <Link
              href="/checkout"
              onClick={(e) => {
                if (!size) {
                  e.preventDefault();
                  toast("Choisis une pointure.");
                  return;
                }
                cart.add({ ...snapshot, size });
              }}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#5B6AF6] text-sm font-semibold text-white"
            >
              ACHETER MAINTENANT
            </Link>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold">À PROPOS DU PRODUIT</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666]">{product.description}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#666]">
              <li>Commande sans compte</li>
              <li>Paiement à la livraison en Tunisie</li>
              <li>Échange 7 jours si non portées</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 text-3xl font-black">TU POURRAIS AUSSI AIMER</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts(products, product.id).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
