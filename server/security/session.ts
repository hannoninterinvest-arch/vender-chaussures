import { NextResponse } from 'next/server';
import { ForbiddenException } from '../http';
export const staffCookie = () => process.env.NODE_ENV === 'production' ? '__Host-elvaro-staff' : 'elvaro-staff';
export function cookieToken(req: Request) {
  const cookie = req.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${staffCookie()}=`));
  return cookie ? cookie.slice(staffCookie().length + 1) : '';
}
function configuredOrigin() {
  try {
    return process.env.APP_URL ? new URL(process.env.APP_URL.trim()).origin : '';
  } catch {
    return '';
  }
}
// Behind some reverse proxies req.url carries an internal host, so the public APP_URL is also accepted.
export function verifyOrigin(req: Request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;
  const origin = req.headers.get('origin');
  const allowed = [new URL(req.url).origin, configuredOrigin()].filter(Boolean);
  if (!origin || !allowed.includes(origin) || req.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ForbiddenException('Origine de requête refusée');
  }
}
export function setStaffCookie(res: NextResponse, token: string) {
  res.cookies.set(staffCookie(), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: token ? 7200 : 0 });
}
