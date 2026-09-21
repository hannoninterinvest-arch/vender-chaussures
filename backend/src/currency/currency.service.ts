import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizeCountryCode } from '../shipping/shipping-rates.config';
import {
  COUNTRY_CURRENCY,
  FALLBACK_RATES_FROM_TND,
  currencyForCountry,
} from './currency.config';

const CACHE_MS = 6 * 60 * 60 * 1000;

type FxCache = { at: number; rates: Record<string, number>; source: string };

@Injectable()
export class CurrencyService {
  private cache: FxCache | null = null;

  constructor(private readonly config: ConfigService) {}

  async quote(country: string) {
    const code = normalizeCountryCode(country);
    const currency = currencyForCountry(code);
    const { rates, source } = await this.loadRates();
    const rateFromTnd = rates[currency] ?? FALLBACK_RATES_FROM_TND[currency] ?? 1;
    return {
      country: code,
      currency,
      rateFromTnd,
      source,
      catalogCurrency: 'TND' as const,
    };
  }

  format(amountInTnd: number, country: string, rates?: Record<string, number>) {
    const currency = currencyForCountry(normalizeCountryCode(country));
    const rate = (rates || FALLBACK_RATES_FROM_TND)[currency] ?? 1;
    return { currency, amount: Number(amountInTnd) * rate };
  }

  currencies() {
    return {
      countryCurrency: COUNTRY_CURRENCY,
      fallbackRatesFromTnd: FALLBACK_RATES_FROM_TND,
    };
  }

  private async loadRates(): Promise<FxCache> {
    const now = Date.now();
    if (this.cache && now - this.cache.at < CACHE_MS) return this.cache;
    try {
      const live = await this.fetchLiveRates();
      this.cache = { at: now, rates: { TND: 1, ...live.rates }, source: live.source };
      return this.cache;
    } catch {
      const fallback: FxCache = {
        at: now,
        rates: { ...FALLBACK_RATES_FROM_TND },
        source: 'fallback',
      };
      this.cache = fallback;
      return fallback;
    }
  }

  private async fetchLiveRates(): Promise<{ rates: Record<string, number>; source: string }> {
    // TODO: définir EXCHANGE_RATE_API_KEY pour le plan avec clé (exchangerate-api.com).
    const key = this.config.get<string>('EXCHANGE_RATE_API_KEY')?.trim();
    const url = key
      ? `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/TND`
      : 'https://open.er-api.com/v6/latest/TND';
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = (await res.json()) as {
      result?: string;
      conversion_rates?: Record<string, number>;
      rates?: Record<string, number>;
    };
    const rates = data.conversion_rates || data.rates;
    if (!rates || typeof rates.USD !== 'number') throw new Error('FX payload invalide');
    return { rates, source: key ? 'exchangerate-api' : 'open.er-api' };
  }
}
