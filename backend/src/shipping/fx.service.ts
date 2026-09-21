import { Injectable, Logger } from '@nestjs/common';

type FxSnapshot = {
  available: boolean;
  base: 'TND';
  rates: Record<string, number>;
  fetchedAt: string | null;
};

@Injectable()
export class FxService {
  private readonly log = new Logger(FxService.name);
  private cache: FxSnapshot = {
    available: false,
    base: 'TND',
    rates: { TND: 1 },
    fetchedAt: null,
  };
  private expires = 0;
  private inflight: Promise<FxSnapshot> | null = null;

  async getRates(): Promise<FxSnapshot> {
    if (this.cache.available && this.expires > Date.now()) return this.cache;
    if (this.inflight) return this.inflight;
    this.inflight = this.refresh()
      .catch((err) => {
        this.log.warn(`Taux de change indisponibles: ${err instanceof Error ? err.message : err}`);
        return {
          ...this.cache,
          available: false,
        };
      })
      .finally(() => {
        this.inflight = null;
      });
    return this.inflight;
  }

  private async refresh(): Promise<FxSnapshot> {
    const res = await fetch('https://open.er-api.com/v6/latest/TND', {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== 'success' || !data.rates) {
      throw new Error('réponse FX invalide');
    }
    const rates: Record<string, number> = { TND: 1 };
    for (const [code, value] of Object.entries(data.rates)) {
      if (Number.isFinite(value) && value > 0) rates[code] = value;
    }
    this.cache = {
      available: true,
      base: 'TND',
      rates,
      fetchedAt: data.time_last_update_utc || new Date().toISOString(),
    };
    this.expires = Date.now() + 6 * 60 * 60 * 1000;
    return this.cache;
  }
}
