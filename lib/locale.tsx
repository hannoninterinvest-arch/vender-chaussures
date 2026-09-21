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

let selectedMemory = "TN";
let detectedMemory = "TN";
let manualMemory = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function readStoredCountry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { country?: string; manual?: boolean };
    if (parsed.country && /^[A-Z]{2}$/.test(parsed.country)) {
      if (parsed.manual) manualMemory = true;
      return parsed.country;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function persistCountry(code: string, manual: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ country: code, manual }));
  } catch {
    /* ignore */
  }
}

if (typeof window !== "undefined") {
  const stored = readStoredCountry();
  if (stored) selectedMemory = stored;
}

const LocaleContextDefault: LocaleValue = {
  detectedCountry: "TN",
  selectedCountry: "TN",
  setSelectedCountry: () => {},
  currency: "TND",
  rateFromTnd: 1,
  formatPrice: (amountInTND: number) => formatConvertedPrice(amountInTND, "TND", 1),
  isLocal: true,
  countries: COUNTRIES,
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [, bump] = useState(0);
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const onChange = () => bump((n) => n + 1);
    listeners.add(onChange);
    const stored = readStoredCountry();
    if (stored && stored !== selectedMemory) {
      selectedMemory = stored;
      emit();
    }

    let cancelled = false;
    fetch("/api/geo", { cache: "no-store", signal: AbortSignal.timeout(4000) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country?: string } | null) => {
        if (cancelled || !data?.country) return;
        const code = data.country.toUpperCase();
        detectedMemory = code;
        if (!manualMemory) {
          selectedMemory = code;
          persistCountry(code, false);
        }
        emit();
      })
      .catch(() => {
        /* garde la valeur courante */
      });
    return () => {
      cancelled = true;
      listeners.delete(onChange);
    };
  }, []);

  const selectedCountry = selectedMemory;
  const detectedCountry = detectedMemory;
  const currency = currencyForCountry(selectedCountry);
  const rateFromTnd = liveRates[currency] ?? FALLBACK_RATES_FROM_TND[currency] ?? 1;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/fx?country=${encodeURIComponent(selectedCountry)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { currency?: string; rateFromTnd?: number } | null) => {
        if (cancelled || !data?.currency || typeof data.rateFromTnd !== "number") return;
        setLiveRates((prev) => ({ ...prev, [data.currency as string]: data.rateFromTnd as number }));
      })
      .catch(() => {
        /* repli déjà appliqué */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCountry]);

  const setSelectedCountry = useCallback((code: string) => {
    const next = code.toUpperCase();
    manualMemory = true;
    selectedMemory = next;
    persistCountry(next, true);
    emit();
  }, []);

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
  return useContext(LocaleContext) ?? LocaleContextDefault;
}

/** Hook demandé : formate un montant catalogue (TND) dans la devise du pays choisi. */
export function useCurrency() {
  const { formatPrice, currency, rateFromTnd, selectedCountry } = useLocale();
  return { formatPrice, currency, rateFromTnd, selectedCountry };
}
