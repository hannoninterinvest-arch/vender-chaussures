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

  it("matches mixed-case e-mails, ignores other applications' accounts and never edits them", async () => {
    const auth = new AuthService(db.getRepository(User), config);
    await db.query(
      'INSERT INTO "users" ("id","email","name","password","role","active") VALUES ($1,$2,$3,$4,$5,$6)',
      ["mixed", "Boss@Example.COM", "Boss", await hash("mixed-case-password", 4), "admin", true],
    );
    await db.query(
      'INSERT INTO "users" ("id","email","name","password","role","active") VALUES ($1,$2,$3,$4,$5,$6)',
      ["investor", "investor@example.com", "Investor", await hash("investor-password-1", 4), "investor", true],
    );
    await expect(auth.login({ email: "boss@example.com", password: "mixed-case-password" })).resolves.toHaveProperty("token");
    await expect(auth.login({ email: "investor@example.com", password: "investor-password-1" })).rejects.toMatchObject({ status: 401 });
    expect((await auth.listStaff()).map((row) => row.id)).not.toContain("investor");
    const actor = { id: "mixed", email: "boss@example.com", name: "Boss", role: "admin" as const };
    await expect(auth.removeStaff("investor", actor)).rejects.toMatchObject({ status: 400 });
    await expect(auth.updateStaff("investor", { active: false }, actor)).rejects.toMatchObject({ status: 400 });
    await expect(auth.createStaff({ email: "INVESTOR@example.com", name: "X", password: "some-long-password", role: "vendeur" })).rejects.toMatchObject({ status: 409 });
    expect(await db.query('SELECT 1 FROM "users" WHERE "id" = $1', ["investor"])).toHaveLength(1);
  });

  it("tolerates role case/spacing and padded hashes, and audits the accounts without leaking hashes", async () => {
    const auth = new AuthService(db.getRepository(User), config);
    const bcrypt = await hash("padded-hash-password", 4);
    await db.query(
      'INSERT INTO "users" ("id","email","name","password","role","active") VALUES ($1,$2,$3,$4,$5,$6)',
      ["padded", "padded@example.com", "Padded", `${bcrypt}  `, "Vendeur ", true],
    );
    const session = await auth.login({ email: "padded@example.com", password: "padded-hash-password" });
    expect(session.user.role).toBe("vendeur");
    await expect(auth.userFromToken(session.token)).resolves.toMatchObject({ id: "padded" });
    expect((await auth.listStaff()).find((row) => row.id === "padded")?.role).toBe("vendeur");
    const { auditUsers } = await import("./schema-check");
    const audit = await auditUsers(db);
    const padded = audit.find((row) => row.email === "padded@example.com");
    expect(padded?.problems.join(" ")).toContain("à normaliser");
    expect(padded?.problems.join(" ")).toContain("espaces parasites");
    expect(audit.find((row) => row.email === "investor@example.com")?.problems.join(" ")).toContain("inconnu");
    expect(JSON.stringify(audit)).not.toContain("$2");
  });
});
