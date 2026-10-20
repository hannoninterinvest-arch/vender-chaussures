import type { DataSource } from "typeorm";
import { User } from "./auth/user.entity";
import { schemaGaps } from "./schema-check";

// Some deployments reuse a `users` table whose bcrypt hash is stored in a
// `password` column instead of `passwordHash`. Map the property to whichever
// column the live table has, so no change to the database is required.
export async function adaptLegacyUsersSchema(db: DataSource) {
  const rows: { column_name: string }[] = await db.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'",
  );
  const names = new Set(rows.map((row) => row.column_name));
  if (names.has("passwordHash") || !names.has("password")) return;
  const column = db
    .getMetadata(User)
    .findColumnWithPropertyName("passwordHash");
  if (!column) return;
  column.databaseName = "password";
  column.databasePath = "password";
  column.databaseNameWithoutPrefixes = "password";
}

// A catalogue created before `cost`, `promoPrice` or `model` existed makes every
// product query fail with 42703 (missing column). Add only the absent product
// columns, with their default, so the catalogue keeps working; nothing is
// dropped, renamed or rewritten.
export async function ensureProductColumns(db: DataSource) {
  const gap = (await schemaGaps(db)).find((item) => item.table === "products");
  if (!gap || gap.tableMissing) return [];
  const added: string[] = [];
  for (const column of gap.missing) {
    try {
      await db.query(column.sql);
      added.push(column.column);
    } catch (error) {
      console.warn(
        "products schema",
        `colonne ${column.column} non ajoutée :`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  return added;
}
