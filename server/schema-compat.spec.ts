import "reflect-metadata";
import { DataType, newDb } from "pg-mem";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { entities } from "./entities";
import { User } from "./auth/user.entity";
import { AuthService } from "./auth/auth.service";
import { ConfigService } from "./config";
import { adaptLegacyUsersSchema } from "./schema-compat";

function memoryDataSource() {
  const memory = newDb({ autoCreateForeignKeyIndices: true });
  for (const fn of [
    { name: "current_database", returns: DataType.text, implementation: () => "test" },
    { name: "version", returns: DataType.text, implementation: () => "PostgreSQL 16" },
    { name: "uuid_generate_v4", returns: DataType.uuid, impure: true, implementation: randomUUID },
  ])
    memory.public.registerFunction(fn);
  memory.public.registerFunction({
    name: "quote_ident",
    args: [DataType.text],
    returns: DataType.text,
    implementation: (value: string) => `"${value}"`,
  });
  memory.public.registerFunction({
    name: "obj_description",
    args: [DataType.regclass, DataType.text],
    returns: DataType.text,
    implementation: () => null,
  });
  return memory.adapters.createTypeormDataSource({ type: "postgres", entities, synchronize: true });
}

describe("legacy users table with a `password` column", () => {
  const db = memoryDataSource();
  const config = new ConfigService({ JWT_SECRET: "compat-tests-only-secret-at-least-32-bytes" });
  beforeAll(async () => {
    await db.initialize();
    await db.query('ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password"');
    await adaptLegacyUsersSchema(db);
    await db.query(
      'INSERT INTO "users" ("id","email","name","password","role","active") VALUES ($1,$2,$3,$4,$5,$6)',
      ["legacy", "admin@example.com", "Admin", await hash("a-very-strong-password", 4), "admin", true],
    );
  });
  afterAll(() => db.destroy());

  it("reads and verifies the hash stored in `password`", async () => {
    const auth = new AuthService(db.getRepository(User), config);
    const session = await auth.login({ email: "ADMIN@example.com", password: "a-very-strong-password" });
    expect(session.user).toEqual({ id: "legacy", email: "admin@example.com", name: "Admin", role: "admin" });
    await expect(auth.userFromToken(session.token)).resolves.toMatchObject({ id: "legacy" });
    await expect(auth.login({ email: "admin@example.com", password: "wrong-password" })).rejects.toMatchObject({ status: 401 });
  });

  it("writes new hashes and new accounts to `password`", async () => {
    const auth = new AuthService(db.getRepository(User), config);
    await auth.changePassword("legacy", { currentPassword: "a-very-strong-password", newPassword: "another-strong-password" });
    await auth.createStaff({ email: "new@example.com", name: "Nouveau", password: "third-strong-password", role: "vendeur" });
    const rows: { email: string; password: string }[] = await db.query('SELECT "email","password" FROM "users" ORDER BY "email"');
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.password.startsWith("$2"))).toBe(true);
    await expect(auth.login({ email: "admin@example.com", password: "another-strong-password" })).resolves.toHaveProperty("token");
  });
});
