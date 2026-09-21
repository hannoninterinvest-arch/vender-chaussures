"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/locale";

export function CountrySelect({
  id,
  className = "",
  fullLabel = false,
}: {
  id?: string;
  className?: string;
  fullLabel?: boolean;
}) {
  const { selectedCountry, setSelectedCountry, countries, currency } = useLocale();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = countries.find((c) => c.code === selectedCountry);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={`country-select ${className}`}>
      <button
        id={id}
        type="button"
        className="country-select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Pays de livraison"
        onClick={() => setOpen((v) => !v)}
      >
        {fullLabel
          ? `${current?.name ?? selectedCountry} · ${currency}`
          : `${selectedCountry} · ${currency}`}
      </button>
      {open && (
        <ul className={`country-select-menu ${fullLabel ? "is-left" : ""}`} role="listbox">
          {countries.map((c) => (
            <li key={c.code} role="option" aria-selected={c.code === selectedCountry}>
              <button
                type="button"
                className={c.code === selectedCountry ? "is-active" : ""}
                onClick={() => {
                  setSelectedCountry(c.code);
                  setOpen(false);
                }}
              >
                {c.code} · {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
