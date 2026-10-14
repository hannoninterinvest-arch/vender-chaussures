import { dispatch } from '../router';
import { services } from '../services';
import { staffCookie } from './session';
import { boundedRequest } from './body';
import { RateLimitError } from './rate-limit';
jest.mock('../services', () => ({ services: jest.fn() }));
describe('staff HTTP security', () => {
  const user = { id: 'admin-id', email: 'admin@example.com', role: 'admin' };
  const fake = { rateLimits: { check: jest.fn() }, auth: { login: jest.fn(async () => ({ token: 'staff-jwt', user })), userFromToken: jest.fn(async () => user), toPublic: jest.fn(x => x), changePassword: jest.fn(async () => ({ token: 'new-jwt', user })) }, orders: { findOne: jest.fn(), retryPayment: jest.fn() } };
  function call(path: string, method = 'POST', headers: Record<string,string> = {}, body?: unknown) {
    return dispatch(new Request(`https://shop.example/api/${path}`, { method, headers: { 'Content-Type': 'application/json', ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) }), path.split('/'));
  }
  beforeEach(() => { jest.clearAllMocks(); jest.mocked(services).mockResolvedValue(fake as unknown as Awaited<ReturnType<typeof services>>); });
  it('rejects cross-site login and cookie mutations before opening the database', async () => {
    expect((await call('auth/login', 'POST', { origin: 'https://evil.example' })).status).toBe(403);
    expect((await call('staff/user', 'PATCH', { cookie: `${staffCookie()}=jwt`, origin: 'https://evil.example' })).status).toBe(403);
    expect(services).not.toHaveBeenCalled();
  });
  it('accepts the configured public APP_URL origin when a proxy rewrites the request host', async () => {
    process.env.APP_URL = 'https://boutique.example';
    try {
      const login = (origin: string) => dispatch(new Request('http://internal:3000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify({ email: user.email, password: 'a-strong-password' }) }), ['auth', 'login']);
      expect((await login('https://boutique.example')).status).toBe(200);
      expect((await login('https://evil.example')).status).toBe(403);
    } finally { delete process.env.APP_URL; }
  });
  it('issues a production HttpOnly Secure host cookie without exposing a bearer token', async () => {
    const old = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true, writable: true });
    try {
      const res = await call('auth/login', 'POST', { origin: 'https://shop.example' }, { email: user.email, password: 'a-strong-password' });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ user });
      const cookie = res.headers.get('set-cookie');
      for (const flag of ['__Host-elvaro-staff=', 'HttpOnly', 'Secure', 'SameSite=lax', 'Path=/']) expect(cookie).toContain(flag);
    } finally { Object.defineProperty(process.env, 'NODE_ENV', { value: old, configurable: true, writable: true }); }
  });
  it('uses the cookie for staff identity and renews it after changing the password', async () => {
    const headers = { origin: 'https://shop.example', cookie: `${staffCookie()}=staff-jwt` };
    const res = await call('auth/password', 'POST', headers, { currentPassword: 'old-password', newPassword: 'new-strong-password' });
    expect(res.status).toBe(200);
    expect(fake.auth.userFromToken).toHaveBeenCalledWith('staff-jwt');
    expect(res.headers.get('set-cookie')).toContain('new-jwt');
    expect((await res.json()).token).toBeUndefined();
  });
  it('clears the cookie on logout without requiring a database', async () => {
    const res = await call('auth/logout', 'POST', { origin: 'https://shop.example' });
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(services).not.toHaveBeenCalled();
  });
  it('blocks customer data and payment retries without a capability before opening the database', async () => {
    expect((await call('orders/KCK-1234', 'GET')).status).toBe(401);
    expect((await call('orders/KCK-1234/pay')).status).toBe(401);
    expect(services).not.toHaveBeenCalled();
  });
  it('returns 429 with Retry-After and does not attempt a login after the limit', async () => {
    fake.rateLimits.check.mockRejectedValueOnce(new RateLimitError(60));
    const res = await call('auth/login', 'POST', { origin: 'https://shop.example' }, { email: user.email, password: 'a-strong-password' });
    expect(res.status).toBe(429); expect(res.headers.get('retry-after')).toBe('60');
    expect(fake.auth.login).not.toHaveBeenCalled();
  });
  it('bounds the body stream even if Content-Length is omitted', async () => {
    const req = new Request('https://shop.example/api/orders', { method: 'POST', body: 'a'.repeat(128 * 1024 + 1) });
    await expect(boundedRequest(req)).rejects.toMatchObject({ status: 413 });
  });
});
