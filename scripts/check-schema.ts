import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

// Usage : npm run db:check            (lecture seule)
//         npm run db:check -- --apply (ajoute les colonnes manquantes)
async function check() {
  const { createDatabase } = await import("../server/database");
  const { schemaGaps } = await import("../server/schema-check");
  const { adaptLegacyUsersSchema } = await import("../server/schema-compat");
  const apply = process.argv.includes("--apply");
  const db = await createDatabase().initialize();
  try {
    await adaptLegacyUsersSchema(db);
    const gaps = await schemaGaps(db);
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
