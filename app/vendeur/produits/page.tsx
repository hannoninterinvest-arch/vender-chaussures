"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { allSizes } from "@/lib/products";
import { formatTnd } from "@/lib/format";
import {
  isAdmin,
  sellerRequest,
  sellerUploadImage,
  type SellerCategory,
  type SellerProduct,
} from "@/lib/seller";
import { useToast } from "@/components/Toast";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  cost: "",
  description: "",
  gender: "unisexe" as SellerProduct["gender"],
  category: "",
  isNew: true,
  colorName: "Noir",
  colorHex: "#171717",
  extraColorName: "",
  extraColorHex: "#5B6AF6",
  sizes: [40, 41, 42, 43, 44] as number[],
  images: ["", "", "", "", ""] as string[],
};

export default function SellerProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [categories, setCategories] = useState<SellerCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const admin = isAdmin();

  async function load() {
    const [p, c] = await Promise.all([
      sellerRequest<SellerProduct[]>("/seller/products"),
      sellerRequest<SellerCategory[]>("/seller/categories"),
    ]);
    setProducts(p);
    setCategories(c);
    setForm((f) => ({ ...f, category: f.category || c[0]?.id || "" }));
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
        setForm((f) => ({ ...f, category: f.category || c[0]?.id || "" }));
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
      cost: String(p.cost ?? 0),
      description: p.description,
      gender: p.gender,
      category: p.category,
      isNew: p.isNew,
      colorName: p.colors[0]?.name || "Noir",
      colorHex: p.colors[0]?.hex || "#171717",
      extraColorName: p.colors[1]?.name || "",
      extraColorHex: p.colors[1]?.hex || "#5B6AF6",
      sizes: p.sizes,
      images: [0, 1, 2, 3, 4].map((i) => p.images[i] || ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const colors = useMemo(() => {
    const list = [{ name: form.colorName.trim() || "Noir", hex: form.colorHex || "#171717" }];
    if (form.extraColorName.trim()) {
      list.push({ name: form.extraColorName.trim(), hex: form.extraColorHex || "#5B6AF6" });
    }
    return list;
  }, [form]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const images = form.images.map((s) => s.trim()).filter(Boolean);
    if (!images.length) {
      toast("Ajoute au moins une photo (Cloudinary)");
      return;
    }
    if (!form.sizes.length) {
      toast("Choisis au moins une pointure");
      return;
    }
    setBusy(true);
    const body = {
      name: form.name,
      brand: form.brand,
      price: Number(form.price),
      cost: Number(form.cost || 0),
      description: form.description,
      gender: form.gender,
      category: form.category,
      isNew: form.isNew,
      colors,
      sizes: form.sizes,
      images,
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
      setForm({ ...emptyForm, category: categories[0]?.id || "" });
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

  function toggleSize(n: number) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(n) ? f.sizes.filter((s) => s !== n) : [...f.sizes, n].sort((a, b) => a - b),
    }));
  }

  async function onUpload(index: number, file: File) {
    setUploading(index);
    try {
      const { url } = await sellerUploadImage(file);
      setForm((f) => {
        const images = [...f.images];
        images[index] = url;
        return { ...f, images };
      });
      toast("Photo enregistrée sur Cloudinary");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload Cloudinary impossible");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[20px] bg-white p-6">
        <h1 className="text-2xl font-black">
          {editing ? "Modifier le produit" : "Nouveau produit"}
        </h1>
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
        <label className="block text-sm font-medium">
          Description
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 min-h-24 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
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
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2"
            >
              {categories.map((c) => (
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
        <p className="text-sm font-bold">Couleurs</p>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="Couleur 1" value={form.colorName} onChange={(v) => setForm({ ...form, colorName: v })} />
          <input
            type="color"
            value={form.colorHex}
            onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
            className="mt-6 h-10 w-14 rounded"
          />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field
            label="Couleur 2 (optionnel)"
            value={form.extraColorName}
            onChange={(v) => setForm({ ...form, extraColorName: v })}
          />
          <input
            type="color"
            value={form.extraColorHex}
            onChange={(e) => setForm({ ...form, extraColorHex: e.target.value })}
            className="mt-6 h-10 w-14 rounded"
          />
        </div>
        <p className="text-sm font-bold">Pointures</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleSize(n)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                form.sizes.includes(n) ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-sm font-bold">Photos (5 max) — Cloudinary</p>
        <p className="text-xs text-[#666]">
          Chaque fichier est envoyé sur Cloudinary. Le lien HTTPS est ensuite enregistré en base.
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
                {uploading === i ? "Envoi…" : url ? "Changer" : "Upload"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void onUpload(i, file);
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
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#5B6AF6] px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {editing ? "Enregistrer" : "Ajouter à la boutique"}
          </button>
          {editing && (
            <button
              type="button"
              className="rounded-lg bg-[#F5F5F5] px-5 py-3 font-medium"
              onClick={() => {
                setEditing(null);
                setForm({ ...emptyForm, category: categories[0]?.id || "" });
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-black">{products.length} produits</h2>
        <ul className="mt-4 space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex gap-3 rounded-[16px] bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover bg-[#EEE]" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-[#666]">
                  {p.brand} · {formatTnd(p.price)} · achat {formatTnd(p.cost || 0)}
                </p>
                <div className="mt-2 flex gap-3 text-sm">
                  <button type="button" className="font-medium text-[#5B6AF6]" onClick={() => startEdit(p)}>
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
        className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
      />
    </label>
  );
}
