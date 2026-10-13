import { UnauthorizedException } from '@/server/http';
import { ConfigService } from '@/server/config';
import { createHmac, timingSafeEqual } from 'crypto';

export class OrderAccessService {
  constructor(private readonly config: ConfigService) {}

  token(id: string) {
    const secret = this.config.get<string>('JWT_SECRET')?.trim();
    if (!secret || Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET doit contenir au moins 32 octets');
    return createHmac('sha256', secret).update(`elvaro:guest-order:v1:${id}`).digest('hex');
  }

  assertAccess(id: string, token?: string) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException('Lien de commande invalide ou incomplet.');
    const expected = Buffer.from(this.token(id), 'hex');
    if (!timingSafeEqual(expected, Buffer.from(token, 'hex'))) throw new UnauthorizedException('Lien de commande invalide ou incomplet.');
  }

  path(id: string) { return `/commande/${encodeURIComponent(id)}#token=${this.token(id)}`; }
}
