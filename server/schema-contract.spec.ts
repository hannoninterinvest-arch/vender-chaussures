import { entities } from "./entities";

// Columns of the production PostgreSQL database (shared with another application).
// Every column the API reads or writes must exist there.
const production: Record<string, string[]> = {
  users: ["id", "email", "name", "password", "role", "active", "createdAt", "firstName", "lastName", "company", "phone", "status", "updatedAt"],
  categories: ["id", "label", "image"],
  products: ["id", "name", "brand", "price", "description", "gender", "category", "isNew", "colors", "sizes", "images", "cost", "featured", "promoPrice", "model"],
  orders: ["id", "customerName", "phone", "gouvernorat", "city", "address", "notes", "payment", "subtotal", "delivery", "total", "createdAt", "status", "paymentPhone", "paymentRef", "paymentStatus", "payUrl", "country", "carrier", "shippingZone"],
  order_items: ["id", "name", "image", "color", "size", "qty", "price", "orderId", "productId", "cost"],
  shipping_rates: ["id", "carrier", "zone", "isLocal", "basePriceTND", "weightIncludedKg", "pricePerExtraKgTND", "updatedAt"],
  site_settings: ["id", "heroKicker", "heroTitle", "heroSubtitle", "coverImages"],
  wholesale_requests: ["id", "company", "contactName", "phone", "email", "gouvernorat", "city", "message", "items", "totalQty", "retailTotal", "status", "staffNote", "createdAt"],
  commerce_records: ["key", "value", "updated_at"],
  security_rate_limits: ["key", "hits", "reset_at"],
};
// users.passwordHash is stored in the legacy `password` column (see schema-compat.ts).
const legacyColumn: Record<string, string> = { "users.passwordHash": "password" };
// Relations map to foreign-key columns named <relation>Id by TypeORM.
const relationColumns: Record<string, string[]> = { order_items: ["orderId", "productId"] };

describe("production schema contract", () => {
  it.each(entities.map((entity) => [entity.options.tableName as string, entity] as const))(
    "%s has every column the API uses",
    (table, entity) => {
      const live = new Set(production[table]);
      const needed = [
        ...Object.keys(entity.options.columns).map((name) => legacyColumn[`${table}.${name}`] ?? name),
        ...(relationColumns[table] ?? []),
      ];
      expect(needed.filter((name) => !live.has(name))).toEqual([]);
    },
  );
});

describe("entity class names", () => {
  it("match their schema names so minified bundles keep working", async () => {
    const { entities } = await import("./entities");
    for (const schema of entities) {
      expect((schema.options.target as { name: string }).name).toBe(schema.options.name);
    }
  });
});
