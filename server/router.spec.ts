import { ensureCommerceStore } from "./commerce-store";
import { Order } from "./orders/order.entity";
import "reflect-metadata";
import { dispatch, readDto } from "./router";
import { services } from "./services";
import { CreateOrderDto } from "./orders/dto/create-order.dto";
import { sign } from "jsonwebtoken";
import { hash } from "bcryptjs";
import { DataType, newDb } from "pg-mem";
import { randomUUID } from "node:crypto";
import { entities } from "./entities";
import { createServices } from "./services";
import { User } from "./auth/user.entity";
import { Product } from "./products/product.entity";
import { ShippingRate } from "./shipping/shipping-rate.entity";

jest.mock("./services", () => ({
  ...jest.requireActual("./services"),
  services: jest.fn(),
}));

function request(path: string, method = "GET", body?: unknown, token?: string) {
  return dispatch(
    new Request(`https://shop.example/api/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    path.split("/"),
  );
}

describe("Next.js API migration", () => {
  it("returns a reference for server failures and keeps their cause in safe logs", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    jest
      .mocked(services)
      .mockRejectedValueOnce({
        driverError: { code: "28P01", message: "secret-password" },
      });
    try {
      const response = await request("auth/login", "POST", {
        email: "admin@example.com",
        password: "secret-password",
      });
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toContain(body.errorId);
      expect(log).toHaveBeenCalledWith(
        "API request failed",
        expect.objectContaining({ errorId: body.errorId, code: "28P01" }),
      );
      expect(JSON.stringify(body)).not.toContain("secret-password");
      expect(JSON.stringify(log.mock.calls)).not.toContain("secret-password");
    } finally {
      log.mockRestore();
    }
  });
  const memory = newDb({ autoCreateForeignKeyIndices: true });
  memory.public.registerFunction({
    name: "current_database",
    returns: DataType.text,
    implementation: () => "test",
  });
  memory.public.registerFunction({
    name: "version",
    returns: DataType.text,
    implementation: () => "PostgreSQL 16",
  });
  memory.public.registerFunction({
    name: "uuid_generate_v4",
    returns: DataType.uuid,
    impure: true,
    implementation: randomUUID,
  });
  memory.public.registerFunction({
    name: "quote_ident",
    args: [DataType.text],
    returns: DataType.text,
    implementation: (value: string) => `"${value}"`,
  });
  memory.public.registerFunction({
    name: "obj_description",
    args: [DataType.regclass, DataType.text],
    returns: DataType.text,
    implementation: () => null,
  });
  const db = memory.adapters.createTypeormDataSource({
    type: "postgres",
    entities,
    synchronize: true,
  });
  let adminToken: string;
  let sellerToken: string;
  let app: ReturnType<typeof createServices>;
  beforeAll(async () => {
    process.env.JWT_SECRET = "integration-test-secret";
    await db.initialize();
    await ensureCommerceStore(db);
    app = createServices(db);
    jest.mocked(services).mockResolvedValue(app);
    await db.getRepository(User).save([
      {
        id: "admin",
        email: "admin@example.com",
        name: "Admin",
        passwordHash: await hash("Admin123456", 10),
        role: "admin",
        active: true,
      },
      {
        id: "seller",
        email: "seller@example.com",
        name: "Seller",
        passwordHash: "unused",
        role: "vendeur",
        active: true,
      },
    ]);
    adminToken = sign({ sub: "admin" }, process.env.JWT_SECRET);
    sellerToken = sign({ sub: "seller" }, process.env.JWT_SECRET);
    await db.getRepository(Product).save({
      id: "shoe",
      name: "Shoe",
      brand: "ELVARO",
      price: 100,
      cost: 50,
      description: "",
      gender: "unisexe",
      category: "shoes",
      colors: [{ name: "black", hex: "#000000" }],
      sizes: [40],
      images: ["shoe.jpg"],
      model: "",
    });
    await db.getRepository(ShippingRate).save({
      carrier: "LA_POSTE",
      zone: "TUNISIE",
      isLocal: true,
      basePriceTND: 7.5,
      weightIncludedKg: 0,
      pricePerExtraKgTND: 0,
    });
  });
  afterAll(async () => {
    if (db.isInitialized) await db.destroy();
    delete process.env.JWT_SECRET;
  });

  it("serves products from the existing PostgreSQL table shape without cost data", async () => {
    const response = await request("products");
    expect(response.status).toBe(200);
    const [product] = await response.json();
    expect(product.price).toBe(100);
    expect(product.cost).toBeUndefined();
  });

  it("authenticates existing password hashes and rejects wrong passwords", async () => {
    expect(
      (
        await request("auth/login", "POST", {
          email: "admin@example.com",
          password: "wrong",
        })
      ).status,
    ).toBe(401);
    const response = await request("auth/login", "POST", {
      email: "admin@example.com",
      password: "Admin123456",
    });
    expect(response.status).toBe(200);
    expect((await response.json()).user.role).toBe("admin");
  });

  it("blocks anonymous staff access and seller access to admin actions", async () => {
    expect((await request("seller/orders")).status).toBe(401);
    expect((await request("staff", "GET", undefined, sellerToken)).status).toBe(
      403,
    );
    expect(
      (await request("seller/products/shoe", "DELETE", undefined, sellerToken))
        .status,
    ).toBe(403);
    expect(
      (await request("admin/shipping-rates", "GET", undefined, adminToken))
        .status,
    ).toBe(200);
  });

  it("creates a COD order with server prices, current delivery, persisted items and opaque ID", async () => {
    const dto = {
      customerName: "Test Client",
      phone: "20123456",
      city: "Tunis",
      address: "Street",
      payment: "cod",
      expectedTotal: 208,
      items: [{ productId: "shoe", size: 40, color: "black", qty: 2 }],
    };
    const response = await request("orders", "POST", dto);
    expect(response.status).toBe(200);
    const order = await response.json();
    expect(order.id).toMatch(/^KCK-[0-9a-f-]{36}$/);
    expect(order.total).toBe(208);
    expect(order.items[0].qty).toBe(2);
    expect((await request(`orders/${order.id}`)).status).toBe(200);
    expect(
      (await request("orders", "POST", { ...dto, expectedTotal: 200 })).status,
    ).toBe(400);
  });

  it("rejects invalid nested quantities and injected totals before business logic", async () => {
    const req = new Request("https://shop.example", {
      method: "POST",
      body: JSON.stringify({
        customerName: "Test",
        phone: "12345678",
        city: "Tunis",
        address: "Street",
        payment: "cod",
        total: 1,
        items: [{ productId: "shoe", size: 40, color: "black", qty: -2 }],
      }),
    });
    await expect(readDto(req, CreateOrderDto)).rejects.toThrow();
  });

  it("verifies webhook triggers without trusting the paid URL or request body", async () => {
    const confirm = jest
      .spyOn(app.orders, "confirmFlouci")
      .mockResolvedValue({ ok: false, paid: false, orderId: "" });
    const response = await dispatch(
      new Request(
        "https://shop.example/api/payments/flouci/webhook?payment_id=ref&paid=1",
      ),
      ["payments", "flouci", "webhook"],
    );
    expect(response.status).toBe(200);
    expect(confirm).toHaveBeenCalledWith("ref");
    expect((await response.json()).paid).toBe(false);
    confirm.mockRestore();
  });

  it("disables public first-admin setup in production", async () => {
    const environment = jest.replaceProperty(process, "env", {
      ...process.env,
      NODE_ENV: "production",
    });
    try {
      expect(
        (
          await request("auth/setup", "POST", {
            name: "Admin",
            email: "new@example.com",
            password: "Password123",
          })
        ).status,
      ).toBe(403);
    } finally {
      environment.restore();
    }
  });
  it("includes every country with editable estimates and denies seller tariff edits", async () => {
    const response = await request(
      "admin/country-rates",
      "GET",
      undefined,
      adminToken,
    );
    expect(response.status).toBe(200);
    const rows = await response.json();
    expect(rows).toHaveLength(498);
    expect(
      rows.find((r: { id: string }) => r.id === "LA_POSTE:FR"),
    ).toMatchObject({ estimated: true, basePriceTND: 29 });
    const dto = {
      enabled: true,
      basePriceTND: 50,
      weightIncludedKg: 2,
      pricePerExtraKgTND: 5,
      weightStepKg: 1,
      maxWeightKg: 30,
      estimated: false,
    };
    expect(
      (
        await request(
          "admin/country-rates/LA_POSTE:FR",
          "PUT",
          dto,
          sellerToken,
        )
      ).status,
    ).toBe(403);
    expect(
      (await request("admin/country-rates/LA_POSTE:FR", "PUT", dto, adminToken))
        .status,
    ).toBe(200);
    const quote = await request("shipping/calculate", "POST", {
      country: "FR",
      carrier: "LA_POSTE",
      weightKg: 4.5,
    });
    expect(await quote.json()).toMatchObject({ price: 65, estimated: false });
    expect(
      (
        await request("orders", "POST", {
          customerName: "Test",
          phone: "12345678",
          city: "Paris",
          address: "Rue",
          payment: "cod",
          country: "FR",
          items: [{ productId: "shoe", size: 40, color: "black", qty: 1 }],
        })
      ).status,
    ).toBe(400);
  });

  it("requires a phone confirmation, then delivery and cash collection, and records returns", async () => {
    const created = await request("orders", "POST", {
      customerName: "COD client",
      phone: "12345678",
      city: "Tunis",
      address: "Rue",
      payment: "cod",
      country: "TN",
      items: [{ productId: "shoe", size: 40, color: "black", qty: 1 }],
    });
    const order = await created.json();
    expect(order.status).toBe("en_attente");
    const path = `seller/orders/${order.id}`;
    expect(
      (await request(path, "PATCH", { status: "en_livraison" }, sellerToken))
        .status,
    ).toBe(400);
    expect(
      (await request(path, "PATCH", { status: "confirmee" }, sellerToken))
        .status,
    ).toBe(400);
    const confirmed = await request(
      path,
      "PATCH",
      { status: "confirmee", callConfirmed: true },
      sellerToken,
    );
    expect((await confirmed.json()).status).toBe("confirmee");
    expect(
      (await request(path, "PATCH", { status: "en_livraison" }, sellerToken))
        .status,
    ).toBe(200);
    expect(
      (await request(path, "PATCH", { status: "livree" }, sellerToken)).status,
    ).toBe(400);
    const delivered = await request(
      path,
      "PATCH",
      { status: "livree", cashReceived: true },
      sellerToken,
    );
    expect(await delivered.json()).toMatchObject({
      status: "livree",
      paymentStatus: "paid",
    });
    expect(
      (await request(path, "PATCH", { status: "retournee" }, sellerToken))
        .status,
    ).toBe(400);
    const returned = await request(
      path,
      "PATCH",
      { status: "retournee", reason: "Client a retourné le colis" },
      sellerToken,
    );
    expect(await returned.json()).toMatchObject({
      status: "retournee",
      refundRequired: true,
    });
    expect(
      (await request(path, "PATCH", { status: "en_livraison" }, sellerToken))
        .status,
    ).toBe(400);
    const history = await request(
      `${path}/history`,
      "GET",
      undefined,
      sellerToken,
    );
    expect((await history.json()).length).toBe(5);
    const stats = await request("seller/stats", "GET", undefined, sellerToken);
    expect(await stats.json()).toMatchObject({
      returned: 1,
      delivered: 0,
      revenue: 0,
    });
  });

  it("only confirms an online order after verified payment and preserves a cancellation on late success", async () => {
    const row = await db.getRepository(Order).save({
      id: "ONLINE-verified",
      customerName: "Online",
      phone: "12345678",
      city: "Paris",
      address: "Rue",
      country: "FR",
      carrier: "LA_POSTE",
      shippingZone: "EUROPE",
      payment: "flouci",
      paymentRef: "verify-ref",
      paymentStatus: "pending",
      payUrl: "https://checkout.flouci.com/test",
      status: "paiement_en_cours",
      subtotal: 100,
      delivery: 29,
      total: 129,
      items: [],
    });
    const path = `seller/orders/${row.id}`;
    expect(
      (await request(path, "PATCH", { status: "confirmee" }, sellerToken))
        .status,
    ).toBe(400);
    const verify = jest.spyOn(app.flouci, "getPayment").mockResolvedValue({
      status: "SUCCESS",
      amount: 129000,
      developer_tracking_id: row.id,
    });
    expect(await app.orders.confirmFlouci("verify-ref")).toMatchObject({
      paid: true,
    });
    expect(await app.orders.findOne(row.id)).toMatchObject({
      status: "confirmee",
      paymentStatus: "paid",
    });
    const historyBefore = await app.orders.history(row.id);
    await app.orders.confirmFlouci("verify-ref");
    expect((await app.orders.history(row.id)).length).toBe(
      historyBefore.length,
    );
    const late = await db.getRepository(Order).save({
      ...row,
      id: "ONLINE-late",
      paymentRef: "late-ref",
      paymentStatus: "pending",
      status: "paiement_en_cours",
    });
    expect(
      (
        await request(
          `seller/orders/${late.id}`,
          "PATCH",
          { status: "annulee", reason: "Client a annulé" },
          sellerToken,
        )
      ).status,
    ).toBe(200);
    verify.mockResolvedValue({
      status: "SUCCESS",
      amount: 129000,
      developer_tracking_id: late.id,
    });
    await app.orders.confirmFlouci("late-ref");
    expect(await app.orders.findOne(late.id)).toMatchObject({
      status: "annulee",
      paymentStatus: "paid",
      refundRequired: true,
    });
    verify.mockRestore();
  });
});
