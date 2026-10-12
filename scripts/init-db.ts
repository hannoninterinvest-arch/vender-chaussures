import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function init() {
  const { createDatabase } = await import("../server/database");
  const { createServices } = await import("../server/services");
  const db = await createDatabase().initialize();
  try {
    // Create schema only for a fresh database; never rewrite existing shop tables.
    const required = [
      "users",
      "products",
      "categories",
      "orders",
      "order_items",
      "shipping_rates",
      "site_settings",
      "wholesale_requests",
    ];
    const tables: { table_name: string }[] = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    const existing = new Set(tables.map((row) => row.table_name));
    const present = required.filter((name) => existing.has(name));
    if (present.length === 0) await db.synchronize();
    else if (present.length !== required.length) {
      throw new Error(
        "Schéma boutique partiel : compléter les tables manquantes avant l’initialisation. Aucune table modifiée.",
      );
    }
    const app = createServices(db);
    await app.auth.onModuleInit();
    await app.shipping.onModuleInit();
    await app.site.onModuleInit();
    // Keep existing catalog. Only insert missing categories, with conflict protection.
    const { Category } = await import("../server/products/category.entity");
    const { categorySeed } = await import("../server/products/catalog");
    await db
      .getRepository(Category)
      .createQueryBuilder()
      .insert()
      .values(categorySeed)
      .orIgnore()
      .execute();
    console.log(
      "Base initialisée. Produits, commandes et comptes existants conservés.",
    );
  } finally {
    await db.destroy();
  }
}
init().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
