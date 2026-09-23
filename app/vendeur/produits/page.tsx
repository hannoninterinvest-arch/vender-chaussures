"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  allSizes,
  BELT_SIZES,
  formatSize,
  isAccessoryCategory,
  isOneSize,
  ONE_SIZE,
} from "@/lib/products";
import { formatTnd } from "@/lib/format";
import {
  isAdmin,
  sellerRequest,
  sellerUploadImage,
  sellerUploadGlb,
  type SellerCategory,
  type SellerProduct,
} from "@/lib/seller";
import { useToast } from "@/components/Toast";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  promoPrice: "",
  cost: "",
  description: "",
  gender: "unisexe" as SellerProduct["gender"],
  category: "",
  isNew: true,
  featured: false,
  colorSlots: [
    { name: "Noir", hex: "#1A1612", image: "" },
    { name: "Or", hex: "#D4AF37", image: "" },
    { name: "Crème", hex: "#F3EDE2", image: "" },
  ],
  sizes: [40, 41, 42, 43, 44] as number[],
  images: ["", "", "", "", ""] as string[],
  model: "",
  kind: "chaussure" as "chaussure" | "accessoire",
};

function looksLikeAccessory(category: string, sizes: number[] = []) {
  return (
    isAccessoryCategory(category) ||
    isOneSize(sizes) ||
    (sizes.length > 0 && sizes.every((s) => s === ONE_SIZE || s >= 70))
  );
}

function accessoryCategoryId(cats: SellerCategory[]) {
  return cats.find((c) => isAccessoryCategory(c.id) || isAccessoryCategory(c.label))?.id || "accessoires";
}

function shoeCategoryId(cats: SellerCategory[], fallback = "") {
  return cats.find((c) => !isAccessoryCategory(c.id) && !isAccessoryCategory(c.label))?.id || fallback;
}

export default function SellerProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [customSize, setCustomSize] = useState("");
  const [listFilter, setListFilter] = useState<"all" | "chaussure" | "accessoire">("all");
  const admin = isAdmin();
  const accessoryMode = form.kind === "accessoire" || isAccessoryCategory(form.category);

  const categoryOptions = useMemo(() => {
    const rows = [...categories];
    if (!rows.some((c) => isAccessoryCategory(c.id) || isAccessoryCategory(c.label))) {
      rows.push({ id: "accessoires", label: "Accessoires", image: "" });
    }
    return rows;
  }, [categories]);

  async function load() {
    const [p, c] = await Promise.all([
      sellerRequest<SellerProduct[]>("/seller/products"),
      sellerRequest<SellerCategory[]>("/seller/categories"),
    ]);
    setProducts(p);
    setCategories(c);
    setForm((f) => ({
      ...f,
      category: f.category || (f.kind === "accessoire" ? accessoryCategoryId(c) : c[0]?.id) || "",
    }));
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      sellerRequest<SellerProduct[]>("/seller/products"),
      sellerRequest<SellerCategory[]>("/seller/categories"),
    ])
      .then(([p, c]) => {
        if (cancelled) return;
        setProducts(p);
        setCategories(c);
        const wantAccessory =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("type") === "accessoire";
        setForm((f) => {
          if (wantAccessory) {
            return {
              ...f,
              kind: "accessoire",
              category: accessoryCategoryId(c),
              sizes: f.kind === "accessoire" && f.sizes.length ? f.sizes : [ONE_SIZE],
            };
          }
          return { ...f, category: f.category || c[0]?.id || "" };
        });
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  function startEdit(p: SellerProduct) {
    setEditing(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      promoPrice: p.promoPrice ? String(p.promoPrice) : "",
      cost: String(p.cost ?? 0),
      description: p.description,
      gender: p.gender,
      category: p.category,
      isNew: p.isNew,
      featured: Boolean(p.featured),
      colorSlots: p.colors.length
        ? p.colors.map((c) => ({ name: c.name, hex: c.hex, image: c.image || "" }))
        : [
            { name: "Noir", hex: "#1A1612", image: "" },
            { name: "Or", hex: "#D4AF37", image: "" },
          ],
      sizes: p.sizes,
      images: [0, 1, 2, 3, 4].map((i) => p.images[i] || ""),
      model: p.model || "",
      kind: looksLikeAccessory(p.category, p.sizes) ? "accessoire" : "chaussure",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const promoPreview = useMemo(() => {
    const price = Number(form.price);
    const promo = Number(form.promoPrice);
    if (!price || !promo || promo <= 0 || promo >= price) return null;
    return {
      promo,
      old: price,
      percent: Math.round(((price - promo) / price) * 100),
    };
  }, [form.price, form.promoPrice]);

  const colors = useMemo(
    () =>
      form.colorSlots
        .map((c) => ({
          name: c.name.trim(),
          hex: c.hex || "#1A1612",
          image: c.image.trim(),
        }))
        .filter((c) => c.name),
    [form.colorSlots],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const extras = form.images.map((s) => s.trim()).filter(Boolean);
    if (!form.sizes.length) {
      toast("Choisis au moins une taille");
      return;
    }
    if (colors.length < 1) {
      toast("Ajoute au moins une couleur");
      return;
    }
    if (colors.some((c) => !c.image)) {
      toast("Ajoute une photo pour chaque couleur");
      return;
    }
    const promo = Number(form.promoPrice || 0);
    if (promo > 0 && promo >= Number(form.price)) {
      toast("Le prix promo doit être inférieur au prix normal");
      return;
    }
    const images = [...new Set([...colors.map((c) => c.image), ...extras])];
    setBusy(true);
    const body = {
      name: form.name,
      brand: form.brand,
      price: Number(form.price),
      promoPrice: promo,
      cost: Number(form.cost || 0),
      description: form.description,
      gender: form.gender,
      category: form.category,
      isNew: form.isNew,
      featured: form.featured,
      colors,
      sizes: form.sizes,
      images,
      model: form.model.trim(),
    };
    try {
      if (editing) {
        await sellerRequest(`/seller/products/${editing}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast("Produit mis à jour");
      } else {
        await sellerRequest("/seller/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast("Produit ajouté à la boutique");
      }
      setEditing(null);
      resetForm(accessoryMode);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce produit de la boutique ?")) return;
    try {
      await sellerRequest(`/seller/products/${id}`, { method: "DELETE" });
      toast("Produit supprimé");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  function resetForm(keepAccessory = false) {
    setForm({
      ...emptyForm,
      kind: keepAccessory ? "accessoire" : "chaussure",
      category: keepAccessory ? accessoryCategoryId(categoryOptions) : categoryOptions[0]?.id || "",
      sizes: keepAccessory ? [ONE_SIZE] : emptyForm.sizes,
    });
    setCustomSize("");
  }

  function toggleSize(n: number) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(n) ? f.sizes.filter((s) => s !== n) : [...f.sizes, n].sort((a, b) => a - b),
    }));
  }

  function setKind(kind: "chaussure" | "accessoire") {
    setForm((f) => {
      if (kind === "accessoire") {
        return {
          ...f,
          kind,
          category: accessoryCategoryId(categoryOptions),
          sizes: looksLikeAccessory(f.category, f.sizes) ? f.sizes : [ONE_SIZE],
        };
      }
      return {
        ...f,
        kind,
        category: shoeCategoryId(categoryOptions, f.category),
        sizes: looksLikeAccessory(f.category, f.sizes) ? [40, 41, 42, 43, 44] : f.sizes,
      };
    });
  }

  function addCustomSize() {
    const raw = customSize.trim().toLowerCase();
    const n =
      raw === "unique" || raw === "tu" || raw === "0"
        ? ONE_SIZE
        : Number(raw.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n) || n < 0) {
      toast("Indique une taille (ex. unique, 95).");
      return;
    }
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(n) ? f.sizes : [...f.sizes, n].sort((a, b) => a - b),
    }));
    setCustomSize("");
  }

  async function onUpload(slot: string, file: File) {
    setUploading(slot);
    try {
      const { url } = await sellerUploadImage(file);
      if (slot.startsWith("color-")) {
        const index = Number(slot.slice(6));
        setForm((f) => ({
          ...f,
          colorSlots: f.colorSlots.map((c, idx) => (idx === index ? { ...c, image: url } : c)),
        }));
      } else {
        const index = Number(slot.slice(8));
        setForm((f) => {
          const images = [...f.images];
          images[index] = url;
          return { ...f, images };
        });
      }
      toast("Photo enregistrée sur Cloudinary");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload Cloudinary impossible");
    } finally {
      setUploading(null);
    }
  }

  async function onUploadGlb(file: File) {
    setUploading("model");
    try {
      const { url } = await sellerUploadGlb(file);
      setForm((f) => ({ ...f, model: url }));
      toast("Fichier 3D GLB enregistré");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload GLB impossible");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] uppercase">
          {editing ? "Modifier le produit" : accessoryMode ? "Nouvel accessoire" : "Nouveau produit"}
        </h1>
        <p className="text-sm text-[#666]">
          {admin
            ? "En admin, tu ajoutes une chaussure ou un accessoire (porte-clés, ceinture, portefeuille…), avec photo."
            : "Ajoute une chaussure ou un accessoire, avec photo."}{" "}
          Pour plusieurs articles, utilise{" "}
          <Link href="/vendeur/import" className="font-bold text-[#C5A059]">
            Import CSV
          </Link>
          .
        </p>
        <div>
          <p className="text-sm font-bold">Type d’article</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind("chaussure")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                !accessoryMode ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5]"
              }`}
            >
              Chaussure
            </button>
            <button
              type="button"
              onClick={() => setKind("accessoire")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                accessoryMode ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5]"
              }`}
            >
              Accessoire
            </button>
          </div>
        </div>
        <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Marque" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} required />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Prix de vente (DT)"
            type="number"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
            required
          />
          <Field
            label="Prix d’achat (DT)"
            type="number"
            value={form.cost}
            onChange={(v) => setForm({ ...form, cost: v })}
          />
        </div>
        <Field
          label="Prix promo (DT) — vide = pas de promo"
          type="number"
          value={form.promoPrice}
          onChange={(v) => setForm({ ...form, promoPrice: v })}
        />
        <p className="text-xs text-[#666]">
          {promoPreview
            ? `En boutique : ${promoPreview.promo} DT affiché, ${promoPreview.old} DT barré (−${promoPreview.percent} %).`
            : "Renseigne un prix promo inférieur au prix de vente : la boutique barrera l’ancien prix."}
        </p>
        <label className="block text-sm font-medium">
          Description
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 min-h-24 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Genre
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as SellerProduct["gender"] })}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2"
            >
              <option value="unisexe">Unisexe</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Catégorie
            <select
              required
              value={form.category}
              onChange={(e) => {
                const category = e.target.value;
                const accessory = isAccessoryCategory(category);
                const sizesFit = accessory
                  ? form.sizes.every((s) => s === ONE_SIZE || s >= 70)
                  : form.sizes.every((s) => s > 0 && s < 70);
                setForm({
                  ...form,
                  category,
                  kind: accessory ? "accessoire" : "chaussure",
                  sizes: sizesFit ? form.sizes : accessory ? [ONE_SIZE] : [40, 41, 42, 43, 44],
                });
              }}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2"
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
          />
          New drop
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Afficher sur la page d’accueil
        </label>
        <p className="text-sm font-bold">Couleurs (jusqu’à 6) — une photo par couleur</p>
        <p className="text-xs text-[#666]">
          Sur la boutique, la photo change automatiquement selon la couleur choisie.
        </p>
        <div className="space-y-3">
          {form.colorSlots.map((slot, i) => (
            <div
              key={i}
              className="grid grid-cols-[88px_1fr_auto] items-end gap-3 rounded-lg border border-[#E5E5E5] p-3"
            >
              <div className="space-y-1">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-[#F5F5F5]">
                  {slot.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-[10px] text-[#888]">Photo</span>
                  )}
                </div>
                <label className="block cursor-pointer rounded-lg bg-[#1A1A1A] px-2 py-1.5 text-center text-[11px] font-bold text-white">
                  {uploading === `color-${i}` ? "Envoi…" : slot.image ? "Changer" : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void onUpload(`color-${i}`, file);
                    }}
                  />
                </label>
              </div>
              <Field
                label={`Couleur ${i + 1}`}
                value={slot.name}
                onChange={(v) =>
                  setForm({
                    ...form,
                    colorSlots: form.colorSlots.map((c, idx) => (idx === i ? { ...c, name: v } : c)),
                  })
                }
              />
              <div className="flex flex-col items-center gap-2">
                <input
                  type="color"
                  value={slot.hex}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      colorSlots: form.colorSlots.map((c, idx) =>
                        idx === i ? { ...c, hex: e.target.value } : c,
                      ),
                    })
                  }
                  className="h-10 w-14 rounded"
                />
                {form.colorSlots.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() =>
                      setForm({ ...form, colorSlots: form.colorSlots.filter((_, idx) => idx !== i) })
                    }
                  >
                    Retirer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {form.colorSlots.length < 6 && (
          <button
            type="button"
            className="text-sm font-medium text-[#C9A45C]"
            onClick={() =>
              setForm({
                ...form,
                colorSlots: [...form.colorSlots, { name: "", hex: "#D4AF37", image: "" }],
              })
            }
          >
            + Ajouter une couleur
          </button>
        )}
        <p className="text-sm font-bold">{accessoryMode ? "Tailles" : "Pointures"}</p>
        {accessoryMode ? (
          <p className="text-xs text-[#666]">
            Taille unique pour un porte-clés ou un portefeuille. Tour de taille en cm pour une ceinture.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(accessoryMode
            ? [...new Set([ONE_SIZE, ...BELT_SIZES, ...form.sizes])]
            : [...new Set([...allSizes, ...form.sizes])]
          )
            .sort((a, b) => a - b)
            .map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleSize(n)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                form.sizes.includes(n) ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5]"
              }`}
            >
              {formatSize(n)}
            </button>
          ))}
        </div>
        {accessoryMode ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="block text-sm font-medium">
              Autre taille
              <input
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="unique ou 110"
                className="mt-1 w-36 rounded-lg border border-[#E5E5E5] px-3 py-2"
              />
            </label>
            <button type="button" className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm" onClick={addCustomSize}>
              Ajouter
            </button>
          </div>
        ) : null}
        <p className="text-sm font-bold">Photos supplémentaires (optionnel)</p>
        <p className="text-xs text-[#666]">
          Galerie libre en plus des photos de couleur. Envoi Cloudinary, lien HTTPS en base.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {form.images.map((url, i) => (
            <div key={i} className="space-y-1">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#F5F5F5]">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-xs text-[#888]">{i + 1}</span>
                )}
              </div>
              <label className="block cursor-pointer rounded-lg bg-[#1A1A1A] px-2 py-1.5 text-center text-[11px] font-bold text-white">
                {uploading === `gallery-${i}` ? "Envoi…" : url ? "Changer" : "Upload"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void onUpload(`gallery-${i}`, file);
                  }}
                />
              </label>
              {url && (
                <button
                  type="button"
                  className="w-full text-[11px] text-red-600"
                  onClick={() =>
                    setForm((f) => {
                      const images = [...f.images];
                      images[i] = "";
                      return { ...f, images };
                    })
                  }
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
        </div>
        {!accessoryMode ? (
        <>
        <label className="block text-sm font-medium">
          Fichier 3D GLB (optionnel)
          <input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="/models/oxford-noir.glb ou https://…"
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        <label className="inline-flex cursor-pointer rounded-sm bg-[#C9A227] px-4 py-2 text-xs font-bold tracking-[0.08em] uppercase text-[#1C1812]">
          {uploading === "model" ? "Envoi…" : form.model ? "Changer le GLB" : "Uploader un .glb"}
          <input
            type="file"
            accept=".glb,model/gltf-binary,application/octet-stream"
            className="hidden"
            disabled={uploading !== null}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void onUploadGlb(file);
            }}
          />
        </label>
        <p className="text-xs text-[#666]">
          La fiche produit affiche le modèle 3D (rotation, zoom). Les photos restent en miniature.
        </p>
        </>
        ) : null}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="gold-btn rounded-sm px-5 py-3 text-xs uppercase disabled:opacity-60"
          >
            {editing ? "Enregistrer" : "Ajouter à la boutique"}
          </button>
          {editing && (
            <button
              type="button"
              className="rounded-lg bg-[#F5F5F5] px-5 py-3 font-medium"
              onClick={() => {
                setEditing(null);
                resetForm(false);
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-black">
          {listFilter === "all"
            ? `${products.length} produits`
            : `${products.filter((p) => (looksLikeAccessory(p.category, p.sizes) ? "accessoire" : "chaussure") === listFilter).length} ${listFilter === "accessoire" ? "accessoires" : "chaussures"}`}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["all", "Tous"],
              ["chaussure", "Chaussures"],
              ["accessoire", "Accessoires"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setListFilter(id)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                listFilter === id ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {products
            .filter((p) =>
              listFilter === "all"
                ? true
                : listFilter === "accessoire"
                  ? looksLikeAccessory(p.category, p.sizes)
                  : !looksLikeAccessory(p.category, p.sizes),
            )
            .map((p) => (
            <li key={p.id} className="flex gap-3 rounded-[4px] border border-[#C5A059]/30 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover bg-[#EEE]" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {p.name}
                  <span className="ml-2 rounded bg-[#F5F5F5] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#666]">
                    {looksLikeAccessory(p.category, p.sizes) ? "Accessoire" : "Chaussure"}
                  </span>
                </p>
                <p className="text-sm text-[#666]">
                  {p.brand} ·{" "}
                  {p.promoPrice ? (
                    <>
                      <span className="font-bold text-[#C0271B]">{formatTnd(p.promoPrice)}</span>{" "}
                      <span className="line-through">{formatTnd(p.price)}</span>
                    </>
                  ) : (
                    formatTnd(p.price)
                  )}{" "}
                  · achat {formatTnd(p.cost || 0)}
                  {p.featured ? " · accueil" : ""}
                  {p.model ? " · 3D" : ""}
                  {` · ${p.sizes.map(formatSize).join(", ")}`}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.colors.map((c) => (
                    <span key={c.name} className="inline-flex items-center gap-1 text-[10px] text-[#666]" title={c.name}>
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" className="h-6 w-6 rounded object-cover" />
                      ) : (
                        <span className="h-6 w-6 rounded border" style={{ background: c.hex }} />
                      )}
                      {c.name}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-3 text-sm">
                  <button type="button" className="font-medium text-[#C5A059]" onClick={() => startEdit(p)}>
                    Modifier
                  </button>
                  {admin && (
                    <button type="button" className="font-medium text-red-600" onClick={() => remove(p.id)}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
      />
    </label>
  );
}
