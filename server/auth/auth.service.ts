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
import { ILike, In, Repository } from 'typeorm';
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
const LIKE_SPECIALS = /[\\%_]/g;
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
    const count = await this.users.count({ where: { role: In(STAFF_ROLES) } });
    if (count > 0) {
      if (this.config.get<string>('ADMIN_RESET_PASSWORD') === 'true') {
        const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
        const password = this.config.get<string>('ADMIN_PASSWORD');
        if (!email || !password) throw new Error('Réinitialisation admin : ADMIN_EMAIL et ADMIN_PASSWORD requis.');
        this.validatePassword(password);
        const admin = await this.findByEmail(email);
        if (!admin || admin.role !== 'admin' || !admin.active) throw new Error('Administrateur actif introuvable pour la réinitialisation.');
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
      role: user.role,
    };
  }

  signToken(user: User) {
    return sign(
      { sub: user.id, email: user.email, role: user.role, credentials: this.credentialVersion(user) },
      this.jwtSecret(),
      { expiresIn: `${TOKEN_HOURS}h`, algorithm: 'HS256', issuer: 'elvaro-api', audience: 'elvaro-staff' },
    );
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.findByEmail(email);
    const ok = await compare(dto.password, user?.passwordHash ?? DECOY_HASH);
    if (!user || !user.active || !STAFF_ROLES.includes(user.role) || RETIRED_PASSWORDS.has(dto.password) || !ok) {
      // Server-side only, without e-mail or password: the client always gets the same message.
      console.warn('Staff login refused', {
        reason: !user
          ? 'unknown_email'
          : !user.active
            ? 'inactive_account'
            : !STAFF_ROLES.includes(user.role)
              ? 'not_a_staff_account'
              : RETIRED_PASSWORDS.has(dto.password)
              ? 'retired_password'
              : !BCRYPT_HASH.test(user.passwordHash ?? '')
                ? 'stored_password_is_not_a_bcrypt_hash'
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
    if (!user || !user.active || !STAFF_ROLES.includes(user.role) || payload.credentials !== this.credentialVersion(user)) {
      throw new UnauthorizedException('Session expirée');
    }
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { id } });
    if (!user || !user.active || !(await compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }
    this.validatePassword(dto.newPassword);
    if (dto.currentPassword === dto.newPassword) throw new BadRequestException('Choisis un nouveau mot de passe.');
    user.passwordHash = await hash(dto.newPassword, 12);
    await this.users.save(user);
    return { token: this.signToken(user), user: this.toPublic(user) };
  }

  listStaff() {
    return this.users.find({ where: { role: In(STAFF_ROLES) }, order: { createdAt: 'ASC' } }).then((rows) =>
      rows.map((u) => ({ ...this.toPublic(u), active: u.active, createdAt: u.createdAt })),
    );
  }

  async createStaff(dto: CreateStaffDto) {
    return this.createUser(dto.email, dto.name, dto.password, dto.role);
  }

  async updateStaff(id: string, dto: UpdateStaffDto, actor: AuthUser) {
    const user = await this.users.findOne({ where: { id, role: In(STAFF_ROLES) } });
    if (!user) throw new BadRequestException('Compte introuvable');

    if (dto.role && dto.role !== 'admin' && user.role === 'admin') {
      await this.ensureAnotherAdmin(id);
    }
    if (dto.active === false && user.role === 'admin') {
      await this.ensureAnotherAdmin(id);
    }
    if (actor.id === id && dto.active === false) {
      throw new BadRequestException('Tu ne peux pas désactiver ton propre compte');
    }

    if (dto.name) user.name = dto.name.trim();
    if (dto.role) user.role = dto.role;
    if (dto.active !== undefined) user.active = dto.active;
    if (dto.password) {
      this.validatePassword(dto.password);
      user.passwordHash = await hash(dto.password, 12);
    }
    return this.toPublic(await this.users.save(user));
  }

  async removeStaff(id: string, actor: AuthUser) {
    if (actor.id === id) {
      throw new BadRequestException('Tu ne peux pas supprimer ton propre compte');
    }
    const user = await this.users.findOne({ where: { id, role: In(STAFF_ROLES) } });
    if (!user) throw new BadRequestException('Compte introuvable');
    if (user.role === 'admin') await this.ensureAnotherAdmin(id);
    await this.users.remove(user);
    return { ok: true };
  }

  private async ensureAnotherAdmin(exceptId: string) {
    const admins = await this.users.find({ where: { role: 'admin', active: true } });
    const remaining = admins.filter((admin) => admin.id !== exceptId);
    if (remaining.length < 1) {
      throw new BadRequestException('Il doit rester au moins un administrateur actif');
    }
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
    return this.toPublic(await this.users.save(user));
  }
}
