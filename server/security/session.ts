import { NextResponse } from 'next/server';
import { ForbiddenException } from '../http';
export const staffCookie = () => process.env.NODE_ENV === 'production' ? '__Host-elvaro-staff' : 'elvaro-staff';
export function cookieToken(req: Request) {
  const cookie = req.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${staffCookie()}=`));
  return cookie ? cookie.slice(staffCookie().length + 1) : '';
}
export function verifyOrigin(req: Request) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
      (req.headers.get('origin') !== new URL(req.url).origin || req.headers.get('sec-fetch-site') === 'cross-site')) {
    throw new ForbiddenException('Origine de requête refusée');
  }
}
export function setStaffCookie(res: NextResponse, token: string) {
  res.cookies.set(staffCookie(), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: token ? 7200 : 0 });
}
