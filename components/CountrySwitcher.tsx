"use client";

import { useLocale } from "@/lib/locale";
import { SHIPPING_COUNTRIES, currencyForCountry } from "@/lib/shipping";

export function CountrySwitcher({ className = "" }: { className?: string }) {
  const { country, setCountry, fxMissing, currency } = useLocale();
  const current = SHIPPING_COUNTRIES.find((row) => row.code === country);
  const title = fxMissing
    ? `Pays : ${current?.name || country} — conversion indisponible, prix en DT`
    : currency === "TND"
      ? "Prix en dinars tunisiens"
      : `Prix en ${currency} (${current?.name || country})`;

  return (
    <label className={`relative inline-flex items-center ${className}`} title={title}>
      <span className="sr-only">Pays et devise</span>
      <select
        aria-label="Pays et devise"
        value={country}
        onChange={(e) => setCountry(e.target.value, { manual: true })}
        className="h-9 max-w-[7.25rem] cursor-pointer appearance-none rounded-full bg-transparent py-1 pl-2.5 pr-6 text-[11px] font-semibold tracking-[0.08em] text-[var(--gold)] outline-none ring-1 ring-[var(--gold)]/45 hover:bg-[var(--gold)]/12 hover:ring-[var(--gold)]"
      >
        {SHIPPING_COUNTRIES.map((row) => (
          <option key={row.code} value={row.code} className="text-[#1A1A1B]">
            {row.flag} {row.code} · {currencyForCountry(row.code)}
          </option>
        ))}
        {!SHIPPING_COUNTRIES.some((row) => row.code === country) && (
          <option value={country} className="text-[#1A1A1B]">
            🌐 {country} · {currencyForCountry(country)}
          </option>
        )}
      </select>
      <span className="pointer-events-none absolute right-2 text-[9px] text-[var(--gold)]" aria-hidden>
        ▾
      </span>
    </label>
  );
}
