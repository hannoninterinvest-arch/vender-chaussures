import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

// Usage : npm run db:check            (lecture seule)
//         npm run db:check -- --apply (ajoute les colonnes manquantes)
async function check() {
  const { createDatabase } = await import("../server/database");
  const { schemaGaps, auditUsers, userInsertBlockers } = await import("../server/schema-check");
  const { adaptLegacyUsersSchema } = await import("../server/schema-compat");
  const apply = process.argv.includes("--apply");
  const db = await createDatabase().initialize();
  try {
    await adaptLegacyUsersSchema(db);
    const gaps = await schemaGaps(db);
    console.log("Comptes équipe (table users) :");
    for (const account of await auditUsers(db))
      console.log(`  ${account.email} [${account.role}${account.active ? "" : ", inactif"}] ${account.problems.length ? "→ " + account.problems.join(" ; ") : "OK"}`);
    const blockers = await userInsertBlockers(db);
    if (blockers.length) {
      console.log(`\nCréation de comptes impossible depuis l'admin : colonnes obligatoires sans valeur par défaut dans users : ${blockers.join(", ")}`);
      for (const name of blockers) console.log(`  ALTER TABLE "users" ALTER COLUMN "${name}" DROP NOT NULL;  -- ou ajouter un DEFAULT`);
    }
    console.log("");
    if (!gaps.length) {
      console.log("Schéma conforme : toutes les colonnes attendues existent.");
      return;
    }
    for (const gap of gaps) {
      if (gap.tableMissing) console.log(`Table absente : ${gap.table}`);
      for (const item of gap.missing) {
        console.log(`Colonne absente : ${gap.table}.${item.column}${item.note ? ` (${item.note})` : ""}`);
        console.log(`  ${item.sql}`);
      }
      if (gap.unknown.length)
        console.log(`Colonnes inconnues du code dans ${gap.table} : ${gap.unknown.join(", ")}`);
    }
    const hasMissing = gaps.some((gap) => gap.tableMissing || gap.missing.length);
    if (!hasMissing) {
      console.log("\nAucune colonne manquante (les colonnes inconnues du code sont ignorées par l'application).");
      return;
    }
    if (!apply) {
      console.log("\nAucune modification faite. Relancer avec --apply pour ajouter les colonnes manquantes.");
      process.exitCode = 1;
      return;
    }
    for (const gap of gaps)
      if (!gap.tableMissing) for (const item of gap.missing) await db.query(item.sql);
    console.log("\nColonnes ajoutées. Les tables absentes ne sont pas créées : utiliser npm run db:init sur une base neuve.");
  } finally {
    await db.destroy();
  }
}
check().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
