"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COUNTRIES,
  currencyForCountry,
  FALLBACK_RATES_FROM_TND,
  formatConvertedPrice,
  isTunisia,
} from "./countries";

const STORAGE_KEY = "elvaro-country";

type LocaleValue = {
  detectedCountry: string;
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
  currency: string;
  rateFromTnd: number;
  formatPrice: (amountInTND: number) => string;
  isLocal: boolean;
  countries: typeof COUNTRIES;
};

const LocaleContext = createContext<LocaleValue | null>(null);

function readStoredCountry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { country?: string };
    return parsed.country && /^[A-Z]{2}$/.test(parsed.country) ? parsed.country : null;
  } catch {
    return null;
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [detectedCountry, setDetectedCountry] = useState("TN");
  const [selectedCountry, setSelected] = useState("TN");
  const [currency, setCurrency] = useState("TND");
  const [rateFromTnd, setRateFromTnd] = useState(1);

  const setSelectedCountry = useCallback((code: string) => {
    const next = code.toUpperCase();
    setSelected(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ country: next, manual: true }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const stored = readStoredCountry();
    if (stored) setSelected(stored);

    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country?: string } | null) => {
        if (cancelled || !data?.country) return;
        const code = data.country.toUpperCase();
        setDetectedCountry(code);
        if (!readStoredCountry()) setSelected(code);
      })
      .catch(() => {
        /* garde TN */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fallbackCurrency = currencyForCountry(selectedCountry);
    const fallbackRate = FALLBACK_RATES_FROM_TND[fallbackCurrency] ?? 1;
    setCurrency(fallbackCurrency);
    setRateFromTnd(fallbackRate);

    fetch(`/api/fx?country=${encodeURIComponent(selectedCountry)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { currency?: string; rateFromTnd?: number } | null) => {
        if (cancelled || !data?.currency || typeof data.rateFromTnd !== "number") return;
        setCurrency(data.currency);
        setRateFromTnd(data.rateFromTnd);
      })
      .catch(() => {
        /* repli déjà appliqué */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCountry]);

  const formatPrice = useCallback(
    (amountInTND: number) => formatConvertedPrice(amountInTND, currency, rateFromTnd),
    [currency, rateFromTnd],
  );

  const value = useMemo<LocaleValue>(
    () => ({
      detectedCountry,
      selectedCountry,
      setSelectedCountry,
      currency,
      rateFromTnd,
      formatPrice,
      isLocal: isTunisia(selectedCountry),
      countries: COUNTRIES,
    }),
    [detectedCountry, selectedCountry, setSelectedCountry, currency, rateFromTnd, formatPrice],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      detectedCountry: "TN",
      selectedCountry: "TN",
      setSelectedCountry: () => {},
      currency: "TND",
      rateFromTnd: 1,
      formatPrice: (amountInTND: number) => formatConvertedPrice(amountInTND, "TND", 1),
      isLocal: true,
      countries: COUNTRIES,
    } satisfies LocaleValue;
  }
  return ctx;
}

/** Hook demandé : formate un montant catalogue (TND) dans la devise du pays choisi. */
export function useCurrency() {
  const { formatPrice, currency, rateFromTnd, selectedCountry } = useLocale();
  return { formatPrice, currency, rateFromTnd, selectedCountry };
}
