import { AuthService } from './auth.service';
import { ConfigService } from '@/server/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
const secret = 'security-tests-only-secret-at-least-32-bytes';
describe('admin account security', () => {
  let user: User;
  let service: AuthService;
  let repo: { count: jest.Mock; findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  beforeEach(async () => {
    user = { id: 'admin-id', email: 'admin@example.com', name: 'Admin', role: 'admin', active: true, passwordHash: await hash('old-password-strong', 4) } as User;
    repo = { count: jest.fn().mockResolvedValue(0), findOne: jest.fn().mockImplementation(() => Promise.resolve(user)), save: jest.fn().mockImplementation(u => Promise.resolve(u)), create: jest.fn() };
    service = new AuthService(repo as unknown as Repository<User>, new ConfigService({ JWT_SECRET: secret, NODE_ENV: 'production' }));
  });
  it('blocks public bootstrap and never creates default accounts', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await service.onModuleInit();
    expect(repo.create).not.toHaveBeenCalled();
    await expect(service.setupFirstAdmin({ email: user.email, name: 'Admin', password: 'strong-password' })).rejects.toMatchObject({ status: 403 });
    jest.restoreAllMocks();
  });
  it('refuses the retired default password even when its hash matches', async () => {
    user.passwordHash = await hash('KicksAdmin123', 4);
    await expect(service.login({ email: user.email, password: 'KicksAdmin123' })).rejects.toMatchObject({ status: 401 });
  });
  it('resets an existing administrator only with explicit server configuration', async () => {
    repo.count.mockResolvedValue(1);
    const reset = new AuthService(repo as unknown as Repository<User>, new ConfigService({ JWT_SECRET: secret, NODE_ENV: 'production', ADMIN_RESET_PASSWORD: 'true', ADMIN_EMAIL: user.email, ADMIN_PASSWORD: 'fresh-strong-password' }));
    const oldToken = reset.signToken(user);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await reset.onModuleInit();
    await expect(reset.login({ email: user.email, password: 'fresh-strong-password' })).resolves.toHaveProperty('token');
    await expect(reset.userFromToken(oldToken)).rejects.toMatchObject({ status: 401 });
    jest.restoreAllMocks();
  });
  it('accepts current sessions and rejects legacy, other algorithms and inactive users', async () => {
    const token = service.signToken(user);
    await expect(service.userFromToken(token)).resolves.toBe(user);
    const legacy = sign({ sub: user.id }, secret);
    await expect(service.userFromToken(legacy)).rejects.toMatchObject({ status: 401 });
    const wrong = sign({ sub: user.id }, secret, { algorithm: 'HS384', issuer: 'elvaro-api', audience: 'elvaro-staff' });
    await expect(service.userFromToken(wrong)).rejects.toMatchObject({ status: 401 });
    user.active = false;
    await expect(service.userFromToken(token)).rejects.toMatchObject({ status: 401 });
  });
  it('requires current password and revokes old sessions after changing credentials', async () => {
    const oldToken = service.signToken(user);
    await expect(service.changePassword(user.id, { currentPassword: 'wrong', newPassword: 'a-new-strong-password' })).rejects.toMatchObject({ status: 401 });
    await expect(service.changePassword(user.id, { currentPassword: 'old-password-strong', newPassword: 'short' })).rejects.toMatchObject({ status: 400 });
    const result = await service.changePassword(user.id, { currentPassword: 'old-password-strong', newPassword: 'a-new-strong-password' });
    await expect(service.userFromToken(oldToken)).rejects.toMatchObject({ status: 401 });
    await expect(service.userFromToken(result.token)).resolves.toBe(user);
    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
