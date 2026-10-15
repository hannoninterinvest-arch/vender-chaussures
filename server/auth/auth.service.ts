import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@/server/http';
import { ConfigService } from '@/server/config';
import { compare, hash } from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { ILike, Repository } from 'typeorm';
import type { AuthUser } from './auth.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { LoginDto } from './dto/login.dto';
import { SetupAdminDto } from './dto/setup-admin.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import type { StaffRole } from './user.entity';
import { User } from './user.entity';

const TOKEN_HOURS = 2;
// The users table can be shared with another application (e.g. investor accounts):
// only these roles may use the shop back office.
const STAFF_ROLES: StaffRole[] = ['admin', 'vendeur'];
// Existing rows may differ in case or carry stray spaces ("Admin", "vendeur ").
const staffRole = (user: Pick<User, 'role'>): StaffRole | null => {
  const role = String(user.role ?? '').trim().toLowerCase();
  return STAFF_ROLES.find((allowed) => allowed === role) ?? null;
};
const storedHash = (user: Pick<User, 'passwordHash'>) => String(user.passwordHash ?? '').trim();
// Names the storage format only (never the value) so a wrong algorithm can be diagnosed from logs.
export function hashFormat(hash: string) {
  const value = hash.trim();
  if (!value) return 'empty';
  if (BCRYPT_HASH.test(value)) return 'bcrypt';
  if (/^\$2[aby]\$/.test(value)) return 'bcrypt_truncated_or_corrupted';
  if (/^\$argon2(id|i|d)\$/.test(value)) return 'argon2';
  if (/^\$?scrypt/i.test(value)) return 'scrypt';
  if (/^\$?pbkdf2|^pbkdf2/i.test(value)) return 'pbkdf2';
  if (/^[a-f0-9]{32}$/i.test(value)) return 'hex_32_md5_like';
  if (/^[a-f0-9]{64}$/i.test(value)) return 'hex_64_sha256_like';
  if (/^[a-f0-9]{128}$/i.test(value)) return 'hex_128_sha512_like';
  return `unrecognized_or_plain_text_length_${value.length}`;
}
const LIKE_SPECIALS = /[\\%_]/g;
const pgError = (error: unknown, depth = 0): { code?: string; column?: string } | undefined => {
  if (!error || typeof error !== 'object' || depth > 4) return;
  const value = error as { code?: unknown; column?: unknown; driverError?: unknown; cause?: unknown };
  if (typeof value.code === 'string' && /^\d{5}$/.test(value.code)) {
    return { code: value.code, column: typeof value.column === 'string' && /^[A-Za-z0-9_]{1,63}$/.test(value.column) ? value.column : undefined };
  }
  return pgError(value.driverError, depth + 1) ?? pgError(value.cause, depth + 1);
};
const RETIRED_PASSWORDS = new Set(['KicksAdmin123', 'Vendeur123']);
// Compared when the account does not exist so response time does not reveal valid e-mails.
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$.{53}$/;
const DECOY_HASH = '$2b$12$8ycWNJTH8ojkeuj6mc7R7.y2yhkQlhirZ5nWsvGOL10upirWc8TbG';

export class AuthService {
  constructor(
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = (await this.users.find()).filter((row) => staffRole(row)).length;
    if (count > 0) {
      if (this.config.get<string>('ADMIN_RESET_PASSWORD') === 'true') {
        const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
        const password = this.config.get<string>('ADMIN_PASSWORD');
        if (!email || !password) throw new Error('Réinitialisation admin : ADMIN_EMAIL et ADMIN_PASSWORD requis.');
        this.validatePassword(password);
        const admin = await this.findByEmail(email);
        if (!admin || staffRole(admin) !== 'admin' || !admin.active) throw new Error('Administrateur actif introuvable pour la réinitialisation.');
        admin.passwordHash = await hash(password, 12);
        await this.users.save(admin);
        console.warn('Mot de passe admin réinitialisé. Retire ADMIN_RESET_PASSWORD et ADMIN_PASSWORD après ce démarrage.');
      }
      return;
    }

    this.jwtSecret();
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.trim() || '';
    const adminPassword =
      this.config.get<string>('ADMIN_PASSWORD') || '';
    const adminName = this.config.get<string>('ADMIN_NAME')?.trim() || 'Administrateur';

    if (!adminEmail || !adminPassword) {
      console.warn(
        'Aucun compte staff : définis ADMIN_EMAIL et ADMIN_PASSWORD avant le premier démarrage.',
      );
      return;
    }

    await this.createUser(adminEmail, adminName, adminPassword, 'admin');

    const vendeurEmail = this.config.get<string>('VENDEUR_EMAIL')?.trim() || '';
    const vendeurPassword =
      this.config.get<string>('VENDEUR_PASSWORD') || '';
    const vendeurName = this.config.get<string>('VENDEUR_NAME')?.trim() || 'Vendeur';
    if (vendeurEmail && vendeurPassword) {
      await this.createUser(vendeurEmail, vendeurName, vendeurPassword, 'vendeur');
    }

    console.log(`Comptes staff créés : ${adminEmail}` + (vendeurPassword ? `, ${vendeurEmail}` : ''));
  }

  async setupNeeded() {
    return { needed: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setupFirstAdmin(_dto: SetupAdminDto) {
    throw new ForbiddenException('La création publique de comptes administrateur est désactivée.');
  }

  jwtSecret() {
    const secret = this.config.get<string>('JWT_SECRET')?.trim();
    if (secret && Buffer.byteLength(secret) >= 32) return secret;
    throw new Error('JWT_SECRET doit contenir au moins 32 octets.');
  }

  toPublic(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: staffRole(user) ?? user.role,
    };
  }

  signToken(user: User) {
    return sign(
      { sub: user.id, email: user.email, role: staffRole(user) ?? user.role, credentials: this.credentialVersion(user) },
      this.jwtSecret(),
      { expiresIn: `${TOKEN_HOURS}h`, algorithm: 'HS256', issuer: 'elvaro-api', audience: 'elvaro-staff' },
    );
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.findByEmail(email);
    const ok = await compare(dto.password, user ? storedHash(user) : DECOY_HASH);
    if (!user || !user.active || !staffRole(user) || RETIRED_PASSWORDS.has(dto.password) || !ok) {
      // Server-side only, without e-mail or password: the client always gets the same message.
      console.warn('Staff login refused', {
        reason: !user
          ? 'unknown_email'
          : !user.active
            ? 'inactive_account'
            : !staffRole(user)
              ? 'not_a_staff_account'
              : RETIRED_PASSWORDS.has(dto.password)
              ? 'retired_password'
              : !BCRYPT_HASH.test(storedHash(user))
                ? `stored_password_is_not_a_bcrypt_hash:${hashFormat(storedHash(user))}`
                : 'wrong_password',
      });
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }
    return { token: this.signToken(user), user: this.toPublic(user) };
  }

  async userFromToken(token: string) {
    let payload: { sub?: unknown; credentials?: string };
    try {
      payload = verify(token, this.jwtSecret(), { algorithms: ['HS256'], issuer: 'elvaro-api', audience: 'elvaro-staff' }) as typeof payload;
    } catch (error) {
      // Only token problems end the session; a missing JWT_SECRET is a server fault.
      if (error instanceof Error && /^JWT_SECRET/.test(error.message)) throw error;
      throw new UnauthorizedException('Session expirée');
    }
    if (typeof payload.sub !== 'string') throw new UnauthorizedException('Session expirée');
    // Database errors propagate as 500 so an outage does not look like an expired session.
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user || !user.active || !staffRole(user) || payload.credentials !== this.credentialVersion(user)) {
      throw new UnauthorizedException('Session expirée');
    }
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { id } });
    if (!user || !user.active || !(await compare(dto.currentPassword, storedHash(user)))) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    this.validatePassword(dto.newPassword);
    if (dto.currentPassword === dto.newPassword) throw new BadRequestException('Choisis un nouveau mot de passe.');
    user.passwordHash = await hash(dto.newPassword, 12);
    await this.users.save(user);
    return { token: this.signToken(user), user: this.toPublic(user) };
  }

  listStaff() {
    return this.users.find({ order: { createdAt: 'ASC' } }).then((rows) =>
      rows.filter((u) => staffRole(u)).map((u) => ({ ...this.toPublic(u), active: u.active, createdAt: u.createdAt })),
    );
  }

  async createStaff(dto: CreateStaffDto) {
    return this.createUser(dto.email, dto.name, dto.password, dto.role);
  }

  async updateStaff(id: string, dto: UpdateStaffDto, actor: AuthUser) {
    const user = await this.staffById(id);
    if (!user) throw new BadRequestException('Compte introuvable');

    if (dto.role && dto.role !== 'admin' && staffRole(user) === 'admin') {
      await this.ensureAnotherAdmin(id);
    }
    if (dto.active === false && staffRole(user) === 'admin') {
      await this.ensureAnotherAdmin(id);
    }
    if (actor.id === id && dto.active === false) {
      throw new BadRequestException('Tu ne peux pas désactiver ton propre compte');
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const taken = await this.findByEmail(email);
      if (taken && taken.id !== id) throw new ConflictException('Cet e-mail est déjà utilisé');
      user.email = email;
    }
    if (dto.name) user.name = dto.name.trim();
    if (dto.role) user.role = dto.role;
    if (dto.active !== undefined) user.active = dto.active;
    if (dto.password) {
      this.validatePassword(dto.password);
      user.passwordHash = await hash(dto.password, 12);
    }
    return this.toPublic(await this.persist(user));
  }

  async removeStaff(id: string, actor: AuthUser) {
    if (actor.id === id) {
      throw new BadRequestException('Tu ne peux pas supprimer ton propre compte');
    }
    const user = await this.staffById(id);
    if (!user) throw new BadRequestException('Compte introuvable');
    if (staffRole(user) === 'admin') await this.ensureAnotherAdmin(id);
    try {
      await this.users.remove(user);
    } catch (error) {
      if (pgError(error)?.code === '23503') {
        throw new ConflictException('Ce compte est référencé par d’autres données de la base : désactive-le au lieu de le supprimer.');
      }
      throw error;
    }
    return { ok: true };
  }

  private async ensureAnotherAdmin(exceptId: string) {
    const admins = (await this.users.find()).filter((row) => staffRole(row) === 'admin' && row.active);
    const remaining = admins.filter((admin) => admin.id !== exceptId);
    if (remaining.length < 1) {
      throw new BadRequestException('Il doit rester au moins un administrateur actif');
    }
  }

  private async staffById(id: string) {
    const user = await this.users.findOne({ where: { id } });
    return user && staffRole(user) ? user : null;
  }

  // Case-insensitive: accounts created by another application may keep mixed-case e-mails.
  private findByEmail(email: string) {
    return this.users.findOne({ where: { email: ILike(email.replace(LIKE_SPECIALS, '\\$&')) } });
  }

  private credentialVersion(user: User) {
    return createHash('sha256').update(user.passwordHash).digest('hex');
  }

  private validatePassword(password: string) {
    if (RETIRED_PASSWORDS.has(password) || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 12 caractères et au maximum 72 octets.');
    }
  }

  private async createUser(email: string, name: string, password: string, role: StaffRole) {
    this.validatePassword(password);
    const normalized = email.trim().toLowerCase();
    const exists = await this.findByEmail(normalized);
    if (exists) throw new ConflictException('Cet e-mail est déjà utilisé');
    const user = this.users.create({
      id: randomUUID(),
      email: normalized,
      name: name.trim(),
      passwordHash: await hash(password, 12),
      role,
      active: true,
    });
    return this.toPublic(await this.persist(user));
  }

  // The users table may be shared with another application whose constraints the shop does not know.
  private async persist(user: User) {
    try {
      return await this.users.save(user);
    } catch (error) {
      const failure = pgError(error);
      if (failure?.code === '23505') throw new ConflictException('Cet e-mail est déjà utilisé');
      if (failure?.code === '23502') {
        throw new BadRequestException(
          `La table users exige la colonne « ${failure.column ?? 'inconnue'} », que la boutique ne renseigne pas : ajoute-lui une valeur par défaut (voir npm run db:check).`,
        );
      }
      throw error;
    }
  }
}
