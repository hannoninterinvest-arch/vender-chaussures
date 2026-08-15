import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import type { AuthUser } from './auth.types';
import { CreateStaffDto } from './dto/create-staff.dto';
import { LoginDto } from './dto/login.dto';
import { SetupAdminDto } from './dto/setup-admin.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import type { StaffRole } from './user.entity';
import { User } from './user.entity';

const TOKEN_HOURS = 12;

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.users.count();
    if (count > 0) return;

    const isProd = this.config.get('NODE_ENV') === 'production';
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.trim() || 'admin@kicks.tn';
    const adminPassword =
      this.config.get<string>('ADMIN_PASSWORD')?.trim() || (isProd ? '' : 'KicksAdmin123');
    const adminName = this.config.get<string>('ADMIN_NAME')?.trim() || 'Administrateur';

    if (!adminPassword) {
      console.warn(
        'Aucun compte staff : définis ADMIN_EMAIL et ADMIN_PASSWORD avant le premier démarrage.',
      );
      return;
    }

    await this.createUser(adminEmail, adminName, adminPassword, 'admin');

    const vendeurEmail = this.config.get<string>('VENDEUR_EMAIL')?.trim() || 'vendeur@kicks.tn';
    const vendeurPassword =
      this.config.get<string>('VENDEUR_PASSWORD')?.trim() || (isProd ? '' : 'Vendeur123');
    const vendeurName = this.config.get<string>('VENDEUR_NAME')?.trim() || 'Vendeur';
    if (vendeurPassword) {
      await this.createUser(vendeurEmail, vendeurName, vendeurPassword, 'vendeur');
    }

    console.log(`Comptes staff créés : ${adminEmail}` + (vendeurPassword ? `, ${vendeurEmail}` : ''));
  }

  async setupNeeded() {
    return { needed: (await this.users.count()) === 0 };
  }

  async setupFirstAdmin(dto: SetupAdminDto) {
    if ((await this.users.count()) > 0) {
      throw new ForbiddenException('Un administrateur existe déjà. Connecte-toi.');
    }
    const user = await this.createUser(dto.email, dto.name, dto.password, 'admin');
    const saved = await this.users.findOne({ where: { id: user.id } });
    if (!saved) throw new BadRequestException('Impossible de créer l’administrateur');
    return { token: this.signToken(saved), user };
  }

  jwtSecret() {
    const secret = this.config.get<string>('JWT_SECRET')?.trim();
    if (secret) return secret;
    if (this.config.get('NODE_ENV') === 'production') {
      throw new Error('JWT_SECRET est obligatoire en production');
    }
    return 'dev-jwt-secret-change-me';
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
      { sub: user.id, email: user.email, role: user.role },
      this.jwtSecret(),
      { expiresIn: `${TOKEN_HOURS}h` },
    );
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email } });
    if (!user || !user.active) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }
    const ok = await compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }
    return { token: this.signToken(user), user: this.toPublic(user) };
  }

  async userFromToken(token: string) {
    try {
      const payload = verify(token, this.jwtSecret()) as { sub: string };
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user || !user.active) {
        throw new UnauthorizedException('Session expirée');
      }
      return user;
    } catch {
      throw new UnauthorizedException('Session expirée');
    }
  }

  listStaff() {
    return this.users.find({ order: { createdAt: 'ASC' } }).then((rows) =>
      rows.map((u) => ({ ...this.toPublic(u), active: u.active, createdAt: u.createdAt })),
    );
  }

  async createStaff(dto: CreateStaffDto) {
    return this.createUser(dto.email, dto.name, dto.password, dto.role);
  }

  async updateStaff(id: string, dto: UpdateStaffDto, actor: AuthUser) {
    const user = await this.users.findOne({ where: { id } });
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
    if (dto.password) user.passwordHash = await hash(dto.password, 10);
    return this.toPublic(await this.users.save(user));
  }

  async removeStaff(id: string, actor: AuthUser) {
    if (actor.id === id) {
      throw new BadRequestException('Tu ne peux pas supprimer ton propre compte');
    }
    const user = await this.users.findOne({ where: { id } });
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

  private async createUser(email: string, name: string, password: string, role: StaffRole) {
    const normalized = email.trim().toLowerCase();
    const exists = await this.users.findOne({ where: { email: normalized } });
    if (exists) throw new ConflictException('Cet e-mail est déjà utilisé');
    const user = this.users.create({
      id: randomUUID(),
      email: normalized,
      name: name.trim(),
      passwordHash: await hash(password, 10),
      role,
      active: true,
    });
    return this.toPublic(await this.users.save(user));
  }
}
