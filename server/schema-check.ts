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

export type UserAudit = { email: string; role: string; active: boolean; problems: string[] };

const BCRYPT = /^\$2[aby]\$\d{2}\$.{53}$/;

// Read-only audit of staff accounts; never prints password material.
export async function auditUsers(db: DataSource): Promise<UserAudit[]> {
  const { User } = await import("./auth/user.entity");
  const { hashFormat } = await import("./auth/auth.service");
  const rows = await db.getRepository(User).find({ order: { createdAt: "ASC" } });
  const seen = new Map<string, number>();
  for (const row of rows) {
    const key = String(row.email ?? "").trim().toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const audits = rows.map((row) => {
    const problems: string[] = [];
    const role = String(row.role ?? "");
    const canonical = role.trim().toLowerCase();
    if (!["admin", "vendeur"].includes(canonical)) problems.push(`rôle « ${role} » inconnu : la connexion sera refusée (attendu admin ou vendeur)`);
    else if (role !== canonical) problems.push(`rôle « ${role} » à normaliser en « ${canonical} » (accepté par l'application)`);
    if (!row.active) problems.push("compte inactif");
    const hash = String(row.passwordHash ?? "");
    if (!BCRYPT.test(hash.trim())) problems.push(`mot de passe stocké au format « ${hashFormat(hash)} », pas en bcrypt : réinitialiser avec npm run db:init ou le SQL de dépannage`);
    else if (hash !== hash.trim()) problems.push("hash avec espaces parasites (toléré par l'application)");
    const email = String(row.email ?? "");
    if (email !== email.trim()) problems.push("e-mail avec espaces : la connexion ne le retrouvera pas");
    if ((seen.get(email.trim().toLowerCase()) ?? 0) > 1) problems.push("e-mail en double (hors casse)");
    return { email, role, active: Boolean(row.active), problems };
  });
  if (!audits.some((a) => ["admin"].includes(a.role.trim().toLowerCase()) && a.active && !a.problems.some((p) => p.includes("inconnu"))))
    audits.push({ email: "(aucun)", role: "-", active: false, problems: ["aucun administrateur actif"] });
  return audits;
}

// Columns of the shared users table that the shop does not fill and that have
// no default: inserting an account from the admin screen would fail on them.
export async function userInsertBlockers(db: DataSource): Promise<string[]> {
  const meta = db.entityMetadatas.find((entity) => entity.tableName === "users");
  if (!meta) return [];
  const known = new Set(meta.columns.map((column) => column.databaseName));
  const rows: { column_name: string }[] = await db.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND is_nullable = 'NO' AND column_default IS NULL AND is_identity = 'NO' AND is_generated = 'NEVER'",
  );
  return rows.map((row) => row.column_name).filter((name) => !known.has(name) && name !== "password");
}
