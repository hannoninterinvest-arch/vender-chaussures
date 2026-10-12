import "reflect-metadata";
import { DataSource } from "typeorm";
import { ensureCommerceStore } from "./commerce-store";
import { entities } from "./entities";

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
  url.searchParams.delete("channel_binding");
  return new DataSource({
    type: "postgres",
    url: url.toString(),
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
          await ensureCommerceStore(db);
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
