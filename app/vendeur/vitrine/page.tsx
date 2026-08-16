"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  isAdmin,
  sellerRequest,
  sellerUploadImage,
  type SellerProduct,
} from "@/lib/seller";
import { useToast } from "@/components/Toast";
import { defaultSite, type SiteHome } from "@/lib/site";

export default function SellerVitrinePage() {
  const toast = useToast();
  const admin = isAdmin();
  const [site, setSite] = useState<SiteHome>(defaultSite);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const productPhotos = useMemo(
    () =>
      products.flatMap((p) =>
        (p.images || []).filter(Boolean).map((url) => ({ url, name: p.name, id: p.id })),
      ),
    [products],
  );

  useEffect(() => {
    let cancelled = false;
    sellerRequest<SellerProduct[]>("/seller/products")
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    sellerRequest<SiteHome>("/seller/site")
      .then((home) => {
        if (!cancelled && home) setSite({ ...defaultSite, ...home });
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function saveSite(next: SiteHome) {
    const saved = await sellerRequest<SiteHome>("/seller/site", {
      method: "PATCH",
      body: JSON.stringify(next),
    });
    setSite(saved);
  }

  async function onSaveTexts(e: FormEvent) {
    e.preventDefault();
    if (!admin) return;
    setBusy(true);
    try {
      await saveSite(site);
      toast("Textes de la page d’accueil enregistrés");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function addCover(url: string) {
    if (!admin) return;
    if (site.coverImages.includes(url)) {
      toast("Cette photo est déjà sur la page de garde");
      return;
    }
    if (site.coverImages.length >= 8) {
      toast("Maximum 8 photos de garde");
      return;
    }
    try {
      await saveSite({ ...site, coverImages: [...site.coverImages, url] });
      toast("Photo ajoutée à la page de garde");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Ajout impossible");
    }
  }

  async function removeCover(url: string) {
    if (!admin) return;
    try {
      await saveSite({ ...site, coverImages: site.coverImages.filter((item) => item !== url) });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  async function moveCover(index: number, dir: -1 | 1) {
    if (!admin) return;
    const next = [...site.coverImages];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await saveSite({ ...site, coverImages: next });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Réorganisation impossible");
    }
  }

  async function onUpload(file: File) {
    if (!admin) return;
    setUploading(true);
    try {
      const { url } = await sellerUploadImage(file);
      await addCover(url);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload Cloudinary impossible");
    } finally {
      setUploading(false);
    }
  }

  async function toggleFeatured(product: SellerProduct) {
    try {
      const updated = await sellerRequest<SellerProduct>(`/seller/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !product.featured }),
      });
      setProducts((rows) => rows.map((p) => (p.id === product.id ? { ...p, featured: updated.featured } : p)));
      toast(updated.featured ? "Produit visible sur l’accueil" : "Produit retiré de l’accueil");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Mise à jour impossible");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">
          Page d’accueil
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666]">
          Choisis les photos de la page de garde (upload ou images déjà liées aux produits). Plus
          d’image Unsplash figée : ce que tu sélectionnes ici s’affiche sur le site.
        </p>
      </div>

      <form onSubmit={onSaveTexts} className="space-y-4 rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
          Textes du bandeau
        </h2>
        <label className="block text-sm font-medium">
          Surtitre
          <input
            value={site.heroKicker}
            disabled={!admin}
            onChange={(e) => setSite({ ...site, heroKicker: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        <label className="block text-sm font-medium">
          Titre
          <input
            value={site.heroTitle}
            disabled={!admin}
            onChange={(e) => setSite({ ...site, heroTitle: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        <label className="block text-sm font-medium">
          Sous-titre
          <textarea
            value={site.heroSubtitle}
            disabled={!admin}
            onChange={(e) => setSite({ ...site, heroSubtitle: e.target.value })}
            className="mt-1 min-h-20 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        {admin && (
          <button type="submit" disabled={busy} className="gold-btn rounded-sm px-5 py-3 text-xs uppercase disabled:opacity-60">
            {busy ? "Enregistrement…" : "Enregistrer les textes"}
          </button>
        )}
      </form>

      <section className="rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
          Photos de garde ({site.coverImages.length}/8)
        </h2>
        <p className="mt-1 text-sm text-[#666]">
          Elles défilent sur le grand visuel d’accueil. L’ordre compte : la première est affichée en premier.
        </p>
        {admin && (
          <label className="mt-4 inline-flex cursor-pointer rounded-sm bg-[#1A1A1B] px-4 py-2 text-xs font-bold tracking-[0.08em] uppercase text-white">
            {uploading ? "Envoi…" : "Uploader une photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void onUpload(file);
              }}
            />
          </label>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {site.coverImages.map((url, i) => (
            <div key={url} className="overflow-hidden rounded-[4px] border border-[#C5A059]/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-36 w-full object-cover" />
              {admin && (
                <div className="flex justify-between px-2 py-1.5 text-[11px]">
                  <button type="button" disabled={i === 0} onClick={() => void moveCover(i, -1)}>
                    ←
                  </button>
                  <button type="button" className="text-red-600" onClick={() => void removeCover(url)}>
                    Retirer
                  </button>
                  <button
                    type="button"
                    disabled={i === site.coverImages.length - 1}
                    onClick={() => void moveCover(i, 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          ))}
          {site.coverImages.length === 0 && (
            <p className="col-span-full text-sm text-[#666]">
              Aucune photo de garde. Uploade une image ou choisis-en une parmi les produits ci-dessous.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
          Images des produits
        </h2>
        <p className="mt-1 text-sm text-[#666]">
          Clique une photo pour l’ajouter à la page de garde.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {productPhotos.map((photo) => {
            const selected = site.coverImages.includes(photo.url);
            return (
              <button
                key={`${photo.id}-${photo.url}`}
                type="button"
                disabled={!admin}
                onClick={() => void (selected ? removeCover(photo.url) : addCover(photo.url))}
                className={`overflow-hidden rounded-[4px] border ${
                  selected ? "border-[#C5A059] ring-2 ring-[#C5A059]/40" : "border-transparent"
                }`}
                title={photo.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.name} className="h-28 w-full object-cover" />
              </button>
            );
          })}
          {productPhotos.length === 0 && (
            <p className="col-span-full text-sm text-[#666]">Ajoute d’abord des photos aux produits.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
          Produits sur l’accueil
        </h2>
        <p className="mt-1 text-sm text-[#666]">
          Coche les modèles à afficher dans la sélection de la page d’accueil (pas seulement les « new drop »).
        </p>
        <ul className="mt-4 space-y-2">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-[4px] border border-[#C5A059]/25 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]} alt="" className="h-14 w-14 rounded-sm object-cover bg-[#EEE]" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-[#888]">{p.brand}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(p.featured)}
                  onChange={() => void toggleFeatured(p)}
                />
                Accueil
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
