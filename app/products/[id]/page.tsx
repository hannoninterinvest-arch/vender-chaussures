"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { colorImage } from "@/lib/product-media";
import { relatedProducts } from "@/lib/products";
import { useCatalog, useProduct } from "@/lib/catalog";
import { formatTnd } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ColorDots } from "@/components/ColorDots";
import { hasPromo, Price, PromoBadge } from "@/components/Price";
import { whatsappHref } from "@/lib/brand";

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
  const [qty, setQty] = useState(1);
  const [sizeHint, setSizeHint] = useState(false);

  if (!product) {
    if (!ready) {
      return <p className="px-6 py-20 text-center text-sm text-[var(--muted)]">Chargement…</p>;
    }
    notFound();
  }

  const selectedColor = color ?? product.colors[0]?.name ?? "";

  const snapshot = {
    productId: product.id,
    name: product.name,
    image: colorImage(product, selectedColor),
    price: Number(product.price),
    size: size ?? 0,
    color: selectedColor,
  };

  function selectColor(name: string) {
    setColor(name);
  }

  function add() {
    if (!size) {
      setSizeHint(true);
      toast("Choisis une pointure.");
      return;
    }
    cart.add({ ...snapshot, size, qty });
    toast(qty > 1 ? `${qty} paires ajoutées.` : "Ajouté au panier.");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 pb-28 md:px-6 lg:pb-10">
      <p className="mb-6 text-[11px] tracking-[0.16em] uppercase text-[var(--muted)]">
        <Link href="/shop" className="hover:text-[#C5A059]">
          Boutique
        </Link>{" "}
        / {product.brand} / {product.name}
      </p>
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery key={`${product.id}-${selectedColor}`} product={product} color={selectedColor} />

        <div>
          {product.isNew && (
            <span className="inline-block rounded-sm bg-[#C5A059] px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-[#1A1A1B]">
              New release
            </span>
          )}
          {product.video ? (
            <span className="badge-3d ml-2 align-middle">Vue 3D</span>
          ) : null}
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-1 text-[11px] tracking-[0.18em] uppercase text-[var(--gold)]">{product.brand}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Price product={product} size="lg" />
            <PromoBadge product={product} />
          </div>
          {hasPromo(product) && product.oldPrice ? (
            <p className="mt-1 text-sm text-[var(--promo)]">
              Tu économises {formatTnd(product.oldPrice - product.price)} sur cette paire.
            </p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--muted)]">Livraison calculée au checkout · Échange 7 jours</p>

          <div className="mt-8">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C5A059]">
              Couleur · {selectedColor}
            </p>
            <div className="mt-3">
              <ColorDots
                colors={product.colors}
                selected={selectedColor}
                onSelect={selectColor}
                showLabels
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C5A059]">
              Pointure EU
            </p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">Tailles disponibles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeHint(false);
                  }}
                  className={`h-12 w-12 rounded-sm text-sm font-medium ${
                    size === s
                      ? "bg-[#C5A059] text-[#1A1A1B]"
                      : "border border-[#C5A059]/35 text-[var(--fg)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeHint ? (
              <p className="mt-2 text-sm text-[#C5A059]">Choisis une pointure pour continuer.</p>
            ) : null}
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C5A059]">Quantité</p>
            <div className="mt-3 inline-flex items-center rounded-sm border border-[#C5A059]/35">
              <button type="button" className="px-4 py-2" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Moins">
                −
              </button>
              <span className="min-w-8 text-center text-sm">{qty}</span>
              <button type="button" className="px-4 py-2" onClick={() => setQty((n) => Math.min(10, n + 1))} aria-label="Plus">
                +
              </button>
            </div>
          </div>

          <div className="mt-8 hidden space-y-3 lg:block">
            <button type="button" onClick={add} className="gold-btn h-12 w-full rounded-sm text-xs uppercase">
              Ajouter au panier
            </button>
            <Link
              href="/checkout"
              onClick={(e) => {
                if (!size) {
                  e.preventDefault();
                  setSizeHint(true);
                  toast("Choisis une pointure.");
                  return;
                }
                cart.add({ ...snapshot, size, qty });
              }}
              className="flex h-12 w-full items-center justify-center rounded-sm border border-[#C5A059] text-xs font-semibold tracking-[0.08em] uppercase text-[#C5A059] hover:bg-[#C5A059]/10"
            >
              Acheter maintenant
            </Link>
            <a
              href={whatsappHref(`Bonjour ELVARO, je m’intéresse à ${product.name} (${selectedColor}).`)}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-sm text-[var(--muted)] underline hover:text-[#C5A059]"
            >
              Demander conseil sur WhatsApp
            </a>
          </div>

          <div className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase">
              À propos du produit
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{product.description}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
              <li>Commande sans compte</li>
              <li>Paiement à la livraison en Tunisie</li>
              <li>Échange 7 jours si non portées</li>
              {product.video ? <li>Vue 3D du modèle disponible dans la galerie</li> : null}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] uppercase">
          Tu pourrais aussi aimer
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts(products, product.id).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <div className="gold-frame fixed inset-x-3 bottom-3 z-40 rounded-[4px] bg-[var(--panel)]/95 p-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-[var(--muted)]">{product.name}</p>
            <Price product={product} />
          </div>
          <button type="button" onClick={add} className="gold-btn h-11 shrink-0 rounded-sm px-5 text-[11px] uppercase">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
