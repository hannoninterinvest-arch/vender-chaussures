import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

export function sellerKey(config: ConfigService) {
  return config.get<string>('SELLER_KEY')?.trim() || 'kicks-vendeur';
}

export function keysMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

@Injectable()
export class SellerGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const raw = req.headers['x-seller-key'];
    const key = Array.isArray(raw) ? raw[0] : raw;
    if (!key || !keysMatch(key, sellerKey(this.config))) {
      throw new UnauthorizedException('Clé vendeur invalide');
    }
    return true;
  }
}
