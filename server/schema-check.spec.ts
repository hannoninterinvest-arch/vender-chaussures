import "reflect-metadata";
import { DataType, newDb } from "pg-mem";
import { randomUUID } from "node:crypto";
import { entities } from "./entities";
import { schemaGaps } from "./schema-check";

describe("schema check", () => {
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
  const db = memory.adapters.createTypeormDataSource({ type: "postgres", entities, synchronize: true });
  beforeAll(() => db.initialize());
  afterAll(() => db.destroy());

  it("reports nothing when the live schema matches the entities", async () => {
    expect(await schemaGaps(db)).toEqual([]);
  });

  it("names a missing users column and suggests a safe ALTER without touching data", async () => {
    await db.query('ALTER TABLE "users" DROP COLUMN "active"');
    const gaps = await schemaGaps(db);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({ table: "users", tableMissing: false, unknown: [] });
    expect(gaps[0].missing).toEqual([
      expect.objectContaining({
        column: "active",
        sql: 'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true;',
      }),
    ]);
  });
});
