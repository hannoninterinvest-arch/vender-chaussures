import { createHash } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { HttpError } from '../http';
export async function ensureRateLimits(db: Pick<DataSource, 'query'>) {
  await db.query(`CREATE TABLE IF NOT EXISTS security_rate_limits (key varchar(64) PRIMARY KEY, hits integer NOT NULL, reset_at bigint NOT NULL)`);
  await db.query('CREATE INDEX IF NOT EXISTS security_rate_limits_expiry ON security_rate_limits (reset_at)');
}
export class RateLimitError extends HttpError {
  constructor(readonly retryAfter: number) { super(429, 'Trop de requêtes. Réessaie plus tard.'); }
}
export class RateLimits {
  private lastCleanup = 0;
  constructor(private readonly db: Pick<DataSource, 'query'>) {}
  private async consume(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const hashed = createHash('sha256').update(key).digest('hex');
    const [row] = await this.db.query(`INSERT INTO security_rate_limits (key, hits, reset_at) VALUES ($1, 1, $2)
      ON CONFLICT (key) DO UPDATE SET
        hits = CASE WHEN security_rate_limits.reset_at <= $3 THEN 1 ELSE security_rate_limits.hits + 1 END,
        reset_at = CASE WHEN security_rate_limits.reset_at <= $3 THEN $2 ELSE security_rate_limits.reset_at END
      RETURNING hits, reset_at`, [hashed, now + windowMs, now]);
    if (Number(row.hits) > limit) throw new RateLimitError(Math.max(1, Math.ceil((Number(row.reset_at) - now) / 1000)));
  }
  async check(req: Request, path: string) {
    if (path === 'health') return;
    // Vercel overwrites X-Forwarded-For. Outside Vercel, share a bucket rather than trusting arbitrary headers.
    const ip = process.env.VERCEL === '1' ? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'local';
    await this.consume(`all:${ip}`, 180, 60_000);
    if (req.method === 'POST' && ['auth/login', 'auth/password'].includes(path)) {
      await this.consume(`login:${ip}`, 15, 900_000);
      const body = await req.clone().json().catch(() => ({}));
      if (typeof body.email === 'string') await this.consume(`account:${body.email.trim().toLowerCase().slice(0, 254)}`, 10, 900_000);
    }
    if (req.method === 'POST' && ['orders', 'wholesale/requests'].includes(path)) await this.consume(`create:${path}:${ip}`, 10, 900_000);
    if (req.method === 'POST' && /^orders\/[^/]+\/pay$/.test(path)) await this.consume(`pay:${ip}`, 5, 60_000);
    if (req.method === 'GET' && path.startsWith('orders/')) await this.consume(`read:${ip}`, 30, 60_000);
    if (req.method === 'POST' && path.startsWith('seller/uploads')) await this.consume(`uploads:${ip}`, 10, 60_000);
    const now = Date.now();
    if (now - this.lastCleanup > 60_000) {
      this.lastCleanup = now;
      await this.db.query('DELETE FROM security_rate_limits WHERE reset_at < $1', [now - 60_000]);
    }
  }
}
