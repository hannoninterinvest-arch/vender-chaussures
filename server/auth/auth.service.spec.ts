import { AuthService, hashFormat } from './auth.service';
import { ConfigService } from '@/server/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
const secret = 'security-tests-only-secret-at-least-32-bytes';
describe('admin account security', () => {
  let user: User;
  let service: AuthService;
  let repo: { count: jest.Mock; find: jest.Mock; findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  beforeEach(async () => {
    user = { id: 'admin-id', email: 'admin@example.com', name: 'Admin', role: 'admin', active: true, passwordHash: await hash('old-password-strong', 4) } as User;
    repo = { count: jest.fn().mockResolvedValue(0), find: jest.fn().mockImplementation(() => Promise.resolve([user])), findOne: jest.fn().mockImplementation(() => Promise.resolve(user)), save: jest.fn().mockImplementation(u => Promise.resolve(u)), create: jest.fn() };
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
  it('answers unknown, inactive and wrong-password logins identically and always checks a hash', async () => {
    const message = 'E-mail ou mot de passe incorrect';
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.login({ email: 'nobody@example.com', password: 'whatever-password' })).rejects.toMatchObject({ status: 401, message });
    user.active = false;
    await expect(service.login({ email: user.email, password: 'old-password-strong' })).rejects.toMatchObject({ status: 401, message });
    user.active = true;
    await expect(service.login({ email: user.email, password: 'not-the-password' })).rejects.toMatchObject({ status: 401, message });
    await expect(service.login({ email: ' ADMIN@Example.com ', password: 'old-password-strong' })).resolves.toHaveProperty('token');
  });
  it('does not turn a database failure into an expired session', async () => {
    const token = service.signToken(user);
    repo.findOne.mockRejectedValueOnce(new Error('connection terminated'));
    await expect(service.userFromToken(token)).rejects.toThrow('connection terminated');
    await expect(service.userFromToken('not-a-jwt')).rejects.toMatchObject({ status: 401 });
  });
  it('reports a missing JWT secret as a server fault instead of a logout', async () => {
    const token = service.signToken(user);
    const broken = new AuthService(repo as unknown as Repository<User>, new ConfigService({ JWT_SECRET: 'short' }));
    await expect(broken.userFromToken(token)).rejects.toThrow('JWT_SECRET');
  });
  it('logs why a login was refused without exposing it to the client or logging credentials', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    user.passwordHash = 'plain-text-password';
    await expect(service.login({ email: user.email, password: 'plain-text-password' })).rejects.toMatchObject({ status: 401, message: 'E-mail ou mot de passe incorrect' });
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.login({ email: 'nobody@example.com', password: 'secret-attempt' })).rejects.toMatchObject({ status: 401 });
    expect(warn.mock.calls.map(call => call[1])).toEqual([{ reason: 'stored_password_is_not_a_bcrypt_hash:unrecognized_or_plain_text_length_19' }, { reason: 'unknown_email' }]);
    expect(JSON.stringify(warn.mock.calls)).not.toMatch(/secret-attempt|nobody@|plain-text/);
    warn.mockRestore();
  });
  it('rejects accounts of other applications sharing the users table', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    user.role = 'investor' as User['role'];
    const token = service.signToken(user);
    await expect(service.login({ email: user.email, password: 'old-password-strong' })).rejects.toMatchObject({ status: 401 });
    await expect(service.userFromToken(token)).rejects.toMatchObject({ status: 401 });
    expect(warn).toHaveBeenCalledWith('Staff login refused', { reason: 'not_a_staff_account' });
    warn.mockRestore();
  });
  it('names the stored hash format without revealing it', () => {
    expect(hashFormat('')).toBe('empty');
    expect(hashFormat('$2y$10$' + 'a'.repeat(53))).toBe('bcrypt');
    expect(hashFormat('$argon2id$v=19$m=65536,t=3,p=4$abc$def')).toBe('argon2');
    expect(hashFormat('scrypt$16384$8$1$salt$hash')).toBe('scrypt');
    expect(hashFormat('pbkdf2_sha256$600000$salt$hash')).toBe('pbkdf2');
    expect(hashFormat('a'.repeat(64))).toBe('hex_64_sha256_like');
    expect(hashFormat('hunter2')).toBe('unrecognized_or_plain_text_length_7');
  });
});
