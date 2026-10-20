import type { DataSource } from "typeorm";
import { User } from "./auth/user.entity";

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
