import { ConfigService } from '@/server/config';
import { DataSource } from 'typeorm';
import { PGlite } from '@electric-sql/pglite';
import { OrderAccessService } from '../orders/order-access.service';
import { RateLimits, ensureRateLimits } from './rate-limit';
import { createDatabase } from '../database';
const secret = 'security-tests-only-secret-at-least-32-bytes';
describe('security controls', () => {
  it('rejects absent, malformed and cross-order capabilities', () => {
    const access = new OrderAccessService(new ConfigService({ JWT_SECRET: secret }));
    expect(() => access.assertAccess('A')).toThrow();
    expect(() => access.assertAccess('A', 'x'.repeat(64))).toThrow();
    expect(() => access.assertAccess('A', access.token('B'))).toThrow();
    expect(() => access.assertAccess('A', access.token('A'))).not.toThrow();
    expect(access.path('A')).toContain('#token=');
  });
  it('verifies PostgreSQL TLS and preserves the production schema', () => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgres://user:pass@db.example/app?sslmode=require';
    try {
      const db = createDatabase();
      expect(db.options).toMatchObject({ ssl: { rejectUnauthorized: true }, synchronize: false });
      expect((db.options as {url: string}).url).not.toContain('sslmode');
    } finally { if (previous === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previous; }
  });
  it('persists login limits across guard instances, normalizes emails and resets expiry', async () => {
    const pool = new PGlite();
    const db = { query: async (sql: string, args?: unknown[]) => (await pool.query(sql, args)).rows } as unknown as DataSource;
    await ensureRateLimits(db);
    await ensureRateLimits(db);
    const context = (ip: string) => new Request('https://shop.example/api/auth/login', { method: 'POST', headers: { 'x-forwarded-for': ip, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: ' ADMIN@Example.COM ' }) });
    const first = new RateLimits(db);
    for (let i = 0; i < 10; i++) await expect(first.check(context(`ip-${i}`), 'auth/login')).resolves.toBeUndefined();
    const second = new RateLimits(db);
    await expect(second.check(context('different-ip'), 'auth/login')).rejects.toMatchObject({ status: 429, retryAfter: expect.any(Number) });
    const stored = await db.query('SELECT key FROM security_rate_limits');
    expect(stored.every((row: {key: string}) => /^[a-f0-9]{64}$/.test(row.key))).toBe(true);
    await db.query('UPDATE security_rate_limits SET reset_at = 0');
    await expect(second.check(context('different-ip'), 'auth/login')).resolves.toBeUndefined();
    await pool.close();
  });
});
