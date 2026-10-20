import { ensureRateLimits } from "./security/rate-limit";
import "reflect-metadata";
import { DataSource } from "typeorm";
import pg from "pg";
import { ensureCommerceStore } from "./commerce-store";
import { entities } from "./entities";
import { adaptLegacyUsersSchema, ensureProductColumns } from "./schema-compat";

// Reuse one small connection pool per warm Vercel instance. Use Neon's pooled URL.
const state = globalThis as typeof globalThis & {
  shopDatabase?: Promise<DataSource>;
};
export function createDatabase() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL est obligatoire");
  let url: URL;
  try {
    url = new URL(process.env.DATABASE_URL.trim());
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname)
      throw new Error();
  } catch {
    throw new Error("DATABASE_URL invalide");
  }
  for (const key of ["channel_binding", "sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  return new DataSource({
    type: "postgres",
    // Explicit import also makes Vercel's dependency tracer include the driver.
    driver: pg,
    url: url.toString(),
    ssl: process.env.NODE_ENV === "production" || !local ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) } : false,
    entities,
    synchronize: false,
    extra: { max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 },
  });
}
export function database() {
  if (!state.shopDatabase) {
    state.shopDatabase = createDatabase()
      .initialize()
      .then(async (db) => {
        try {
          await adaptLegacyUsersSchema(db);
          await ensureProductColumns(db);
          await ensureCommerceStore(db);
          await ensureRateLimits(db);
          return db;
        } catch (error) {
          await db.destroy();
          throw error;
        }
      })
      .catch((error) => {
        state.shopDatabase = undefined;
        throw error;
      });
  }
  return state.shopDatabase;
}
