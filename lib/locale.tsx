"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { fetchFxRates, fetchGeoCountry } from "@/lib/api";
import {
  currencyForCountry,
  displayPrice,
  normalizeCountry,
} from "@/lib/shipping";

const COUNTRY_KEY = "elvaro-country";
const LOCK_KEY = "elvaro-country-manual";

type LocaleSnapshot = {
  country: string;
  locked: boolean;
  geoReady: boolean;
  source: "ip" | "manual" | "default" | "saved";
  rates: Record<string, number>;
  fxAvailable: boolean;
};

const DEFAULT_SNAPSHOT: LocaleSnapshot = {
  country: "TN",
  locked: false,
  geoReady: false,
  source: "default",
  rates: { TND: 1 },
  fxAvailable: true,
};

let snapshot: LocaleSnapshot = { ...DEFAULT_SNAPSHOT };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COUNTRY_KEY, snapshot.country);
    if (snapshot.locked) localStorage.setItem(LOCK_KEY, "1");
    else localStorage.removeItem(LOCK_KEY);
  } catch {
    /* ignore */
  }
}

function loadSaved() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    const locked = localStorage.getItem(LOCK_KEY) === "1";
    if (saved && /^[A-Z]{2}$/i.test(saved)) {
      snapshot = {
        ...snapshot,
        country: normalizeCountry(saved),
        locked,
        source: locked ? "manual" : "saved",
      };
    }
  } catch {
    /* ignore */
  }
}

function subscribe(listener: () => void) {
  loadSaved();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  loadSaved();
  return snapshot;
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT;
}

function patch(partial: Partial<LocaleSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function setLocaleCountry(code: string, opts?: { manual?: boolean; source?: LocaleSnapshot["source"] }) {
  const country = normalizeCountry(code);
  snapshot = {
    ...snapshot,
    country,
    locked: opts?.manual ? true : snapshot.locked,
    source: opts?.manual ? "manual" : opts?.source || snapshot.source,
    geoReady: true,
  };
  persist();
  emit();
}

type LocaleContextValue = {
  country: string;
  currency: string;
  setCountry: (code: string, opts?: { manual?: boolean }) => void;
  geoReady: boolean;
  source: LocaleSnapshot["source"];
  rates: Record<string, number>;
  fxAvailable: boolean;
  fxMissing: boolean;
  display: (amountDt: number) => ReturnType<typeof displayPrice>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

async function detectBrowserCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = (await res.json()) as { country_code?: string; error?: boolean };
    if (data.error || !data.country_code) return null;
    return normalizeCountry(data.country_code);
  } catch {
    return null;
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    let cancelled = false;
    async function detect() {
      try {
        const geo = await fetchGeoCountry();
        if (cancelled) return;
        const next = normalizeCountry(geo.country || "TN");
        const fromIp = geo.source === "ip" || geo.source === "cache";
        if (!snapshot.locked) {
          if (fromIp) {
            setLocaleCountry(next, { source: "ip" });
          } else {
            const browser = await detectBrowserCountry();
            if (cancelled) return;
            if (browser) setLocaleCountry(browser, { source: "ip" });
            else {
              patch({ geoReady: true, source: snapshot.source === "saved" ? "saved" : "default" });
            }
          }
        } else {
          patch({ geoReady: true });
        }
      } catch {
        if (cancelled) return;
        if (!snapshot.locked) {
          const browser = await detectBrowserCountry();
          if (cancelled) return;
          if (browser) setLocaleCountry(browser, { source: "ip" });
          else patch({ geoReady: true });
        } else {
          patch({ geoReady: true });
        }
      }
    }
    void detect();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFxRates()
      .then((fx) => {
        if (cancelled) return;
        patch({
          fxAvailable: Boolean(fx.available),
          rates: fx.rates || { TND: 1 },
        });
      })
      .catch(() => {
        if (!cancelled) patch({ fxAvailable: false, rates: { TND: 1 } });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCountry = useCallback((code: string, opts?: { manual?: boolean }) => {
    setLocaleCountry(code, { manual: opts?.manual !== false, source: "manual" });
  }, []);

  const currency = currencyForCountry(state.country);
  const fxMissing = currency !== "TND" && (!state.fxAvailable || !state.rates[currency]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      country: state.country,
      currency,
      setCountry,
      geoReady: state.geoReady,
      source: state.source,
      rates: state.rates,
      fxAvailable: state.fxAvailable && !fxMissing,
      fxMissing,
      display: (amountDt: number) => displayPrice(amountDt, currency, state.rates),
    }),
    [state, currency, fxMissing, setCountry],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      country: "TN",
      currency: "TND",
      setCountry: () => {},
      geoReady: true,
      source: "default" as const,
      rates: { TND: 1 },
      fxAvailable: true,
      fxMissing: false,
      display: (amountDt: number) => displayPrice(amountDt, "TND", { TND: 1 }),
    };
  }
  return ctx;
}
