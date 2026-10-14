import type { DataSource } from "typeorm";

export type SchemaGap = {
  table: string;
  missing: { column: string; sql: string; note?: string }[];
  unknown: string[];
  tableMissing: boolean;
};

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

// Read-only comparison between the entities in server/entities.ts and the live
// PostgreSQL tables. Never modifies anything; the SQL is only suggested.
export async function schemaGaps(db: DataSource): Promise<SchemaGap[]> {
  const gaps: SchemaGap[] = [];
  for (const meta of db.entityMetadatas) {
    const rows: { column_name: string }[] = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1",
      [meta.tableName],
    );
    const existing = new Set(rows.map((row) => row.column_name));
    const expected = new Set(meta.columns.map((column) => column.databaseName));
    const missing = meta.columns
      .filter((column) => !existing.has(column.databaseName))
      .map((column) => {
        const type =
          column.type === "decimal" && column.precision
            ? `numeric(${column.precision},${column.scale ?? 0})`
            : String(column.type);
        const fallback =
          column.default !== undefined && column.default !== null
            ? db.driver.normalizeDefault(column)
            : undefined;
        const safe = !column.isPrimary && fallback !== undefined;
        return {
          column: column.databaseName,
          sql: `ALTER TABLE ${quote(meta.tableName)} ADD COLUMN IF NOT EXISTS ${quote(column.databaseName)} ${type}${safe ? ` NOT NULL DEFAULT ${fallback}` : ""};`,
          ...(safe
            ? {}
            : { note: "Pas de valeur par défaut : colonne ajoutée nullable, à renseigner avant usage." }),
        };
      });
    const tableMissing = existing.size === 0;
    if (tableMissing || missing.length || [...existing].some((name) => !expected.has(name))) {
      gaps.push({
        table: meta.tableName,
        missing,
        unknown: [...existing].filter((name) => !expected.has(name)),
        tableMissing,
      });
    }
  }
  return gaps;
}
