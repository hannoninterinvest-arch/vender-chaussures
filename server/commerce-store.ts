import type { DataSource, EntityManager } from "typeorm";

/** Adds a single isolated key/value table. No existing shop schema/data is rewritten. */
export async function ensureCommerceStore(db: DataSource) {
  await db.query(`CREATE TABLE IF NOT EXISTS commerce_records (
    key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
}
export class CommerceStore {
  constructor(private readonly db: DataSource) {}
  async get<T>(key: string): Promise<T | null> {
    const rows = await this.db.query(
      "SELECT value FROM commerce_records WHERE key = $1",
      [key],
    );
    return rows[0]?.value ?? null;
  }
  async list<T>(prefix: string): Promise<T[]> {
    const rows: { value: T }[] = await this.db.query(
      "SELECT value FROM commerce_records WHERE key LIKE $1 ORDER BY key",
      [`${prefix}%`],
    );
    return rows.map((row) => row.value);
  }
  async put(
    key: string,
    value: unknown,
    manager: EntityManager = this.db.manager,
  ) {
    await manager.query(
      `INSERT INTO commerce_records (key,value) VALUES ($1,$2::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value)],
    );
  }
}
