"use client";

import Link from "next/link";
import { useState } from "react";
import { CSV_TEMPLATE, parseProductCsv, type CsvParseError } from "@/lib/csv-products";
import { importProductsCsv, sellerRequest, type SellerCategory } from "@/lib/seller";
import { useToast } from "@/components/Toast";

export default function SellerImportPage() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(0);
  const [parseErrors, setParseErrors] = useState<CsvParseError[]>([]);
  const [result, setResult] = useState<{ created: number; errors: { name: string; message: string }[] } | null>(
    null,
  );

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-produits.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File) {
    setResult(null);
    const text = await file.text();
    const parsed = parseProductCsv(text);
    setParseErrors(parsed.errors);
    setPreview(parsed.products.length);
    if (!parsed.products.length) {
      toast(parsed.errors[0]?.message || "Aucun produit valide");
      return;
    }

    const categories = await sellerRequest<SellerCategory[]>("/seller/categories");
    const known = new Set(categories.flatMap((c) => [c.id, c.label.toLowerCase()]));
    const unknown = parsed.products.filter(
      (p) => !known.has(p.category) && !known.has(p.category.toLowerCase()),
    );
    if (unknown.length) {
      toast(
        `Catégorie inconnue pour ${unknown[0].name} (${unknown[0].category}). Crée-la d’abord dans Catégories.`,
      );
    }

    setBusy(true);
    try {
      const out = await importProductsCsv(parsed.products);
      setResult({ created: out.created, errors: out.errors });
      toast(
        out.created
          ? `${out.created} produit(s) ajouté(s)`
          : "Aucun produit importé — vois les erreurs",
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Import impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">Import CSV</h1>
      <p className="mt-2 text-sm text-[#666]">
        Ajoute plusieurs paires d’un coup. Chaque ligne = un produit. Les photos sont des{" "}
        <strong>liens HTTPS</strong> (Cloudinary, Unsplash, etc.), séparés par{" "}
        <code>|</code>. Une photo par couleur peut aussi être indiquée dans la colonne <code>couleurs</code>.
      </p>

      <div className="mt-6 space-y-3 rounded-[4px] border border-[#C5A059]/35 bg-white p-6 text-sm">
        <p className="font-bold">Colonnes (Excel : séparateur point-virgule)</p>
        <p>
          <code>nom;marque;prix;promo;achat;description;genre;categorie;nouveau;couleurs;pointures;images;video</code>
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[#666]">
          <li>
            <strong>images</strong> : <code>https://…/photo1.jpg|https://…/photo2.jpg</code>
          </li>
          <li>
            <strong>promo</strong> : prix promotionnel, à laisser vide s’il n’y a pas de promo. La
            boutique barre alors le prix normal.
          </li>
          <li>
            <strong>pointures</strong> : <code>40|41|42|43</code>
          </li>
          <li>
            <strong>couleurs</strong> : <code>Noir:#171717@https://…/noir.jpg|Blanc:#ffffff@https://…/blanc.jpg</code>
            — le <code>@</code> lie la photo à la couleur. Sans photo, la 1re image de la colonne <code>images</code> est utilisée.
          </li>
          <li>
            <strong>video</strong> (optionnel) : lien HTTPS Cloudinary de la vidéo 3D
            (<code>https://res.cloudinary.com/…/video/upload/…mp4</code>)
          </li>
          <li>
            <strong>categorie</strong> : id ou nom déjà créé (ex. <code>ville</code>, <code>ceremonie</code>)
          </li>
          <li>
            <strong>genre</strong> : homme, femme ou unisexe
          </li>
        </ul>
        <button
          type="button"
          onClick={downloadTemplate}
          className="rounded-lg bg-[#F5F5F5] px-4 py-2 font-bold"
        >
          Télécharger le modèle CSV
        </button>
      </div>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[4px] border-2 border-dashed border-[#C5A059]/50 bg-white px-6 py-12 text-center">
        <p className="text-lg font-black">{busy ? "Import en cours…" : "Choisir un fichier .csv"}</p>
        <p className="mt-1 text-sm text-[#666]">UTF-8, jusqu’à 200 produits</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void onFile(file);
          }}
        />
      </label>

      {preview > 0 && (
        <p className="mt-4 text-sm text-[#666]">{preview} produit(s) lu(s) dans le fichier.</p>
      )}

      {parseErrors.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-red-600">
          {parseErrors.map((err) => (
            <li key={`${err.line}-${err.message}`}>
              Ligne {err.line} : {err.message}
            </li>
          ))}
        </ul>
      )}

      {result && (
        <div className="mt-6 rounded-[4px] border border-[#C5A059]/35 bg-white p-5 text-sm">
          <p className="font-bold">{result.created} produit(s) ajouté(s) à la boutique.</p>
          {result.errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-red-600">
              {result.errors.map((err) => (
                <li key={`${err.name}-${err.message}`}>
                  {err.name} : {err.message}
                </li>
              ))}
            </ul>
          )}
          <Link href="/vendeur/produits" className="mt-4 inline-block font-bold text-[#C5A059]">
            Voir les produits
          </Link>
        </div>
      )}
    </div>
  );
}
