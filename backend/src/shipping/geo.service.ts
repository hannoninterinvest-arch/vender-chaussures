import { Injectable, Logger } from '@nestjs/common';
import { normalizeCountry } from './shipping';

const PRIVATE_IP =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|localhost|::ffff:127\.)/i;

type GeoCache = { country: string; expires: number };

@Injectable()
export class GeoService {
  private readonly log = new Logger(GeoService.name);
  private readonly cache = new Map<string, GeoCache>();

  async detectCountry(ip: string | undefined) {
    const clientIp = this.cleanIp(ip);
    if (!clientIp || PRIVATE_IP.test(clientIp)) {
      return {
        country: 'TN',
        source: 'default',
        reason: 'local-or-private-ip',
      };
    }

    const hit = this.cache.get(clientIp);
    if (hit && hit.expires > Date.now()) {
      return { country: hit.country, source: 'cache' };
    }

    const lookedUp =
      (await this.fromIpApiCo(clientIp)) || (await this.fromIpApiCom(clientIp));
    const country = lookedUp || 'TN';
    this.cache.set(clientIp, { country, expires: Date.now() + 60 * 60 * 1000 });
    if (!lookedUp) {
      this.log.warn(`Géolocalisation IP échouée pour ${clientIp} → défaut TN`);
    }
    return {
      country,
      source: lookedUp ? 'ip' : 'default',
    };
  }

  clientIp(req: { ip?: string; headers: Record<string, unknown> }) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const raw =
      (typeof forwarded === 'string' ? forwarded.split(',')[0] : '') ||
      (typeof realIp === 'string' ? realIp : '') ||
      req.ip ||
      '';
    return this.cleanIp(raw);
  }

  private cleanIp(value?: string) {
    return (value || '').trim().replace(/^::ffff:/, '');
  }

  private async fromIpApiCo(ip: string) {
    try {
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
        signal: AbortSignal.timeout(2500),
        headers: { 'User-Agent': 'elvaro-checkout/1.0' },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { country_code?: string; error?: boolean };
      if (data.error || !data.country_code) return null;
      return normalizeCountry(data.country_code);
    } catch {
      return null;
    }
  }

  private async fromIpApiCom(ip: string) {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
        { signal: AbortSignal.timeout(2500) },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { status?: string; countryCode?: string };
      if (data.status !== 'success' || !data.countryCode) return null;
      return normalizeCountry(data.countryCode);
    } catch {
      return null;
    }
  }
}
