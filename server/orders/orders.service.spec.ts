import { OrderAccessService } from "./order-access.service";
import type { EntityManager } from "typeorm";
import { OrdersService } from "./orders.service";
import { FlouciService } from "../payments/flouci.service";
import { ConfigService } from "@/server/config";

// Exercise order totals and gateway handling without writing to a live database.
describe("OrdersService payments and delivery", () => {
  function setup() {
    const config = new ConfigService({
      JWT_SECRET: "test-security-secret-at-least-32-bytes",
      FLOUCI_PUBLIC_KEY: "public",
      FLOUCI_SECRET_KEY: "secret",
    });
    const flouci = new FlouciService(config);
    const orders = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => x),
      exists: jest.fn(async () => false),
      remove: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(async () => ({ affected: 1 })),
    };
    const items = { create: jest.fn((x) => x) };
    const products = {
      getEntity: jest.fn(async () => ({
        name: "Shoe",
        sizes: [40],
        images: ["shoe.jpg"],
        price: 100,
        cost: 50,
      })),
    };
    const shipping = {
      quote: jest.fn(async () => ({
        country: "TN",
        zone: "TUNISIE",
        price: 8,
      })),
    };
    const repository = {
      ...orders,
      manager: {
        transaction: async (
          callback: (manager: EntityManager) => Promise<unknown>,
        ) =>
          callback({ getRepository: () => orders } as unknown as EntityManager),
      },
    };
    const service = new OrdersService(
      repository as unknown as ConstructorParameters<typeof OrdersService>[0],
      items as unknown as ConstructorParameters<typeof OrdersService>[1],
      products as unknown as ConstructorParameters<typeof OrdersService>[2],
      shipping as unknown as ConstructorParameters<typeof OrdersService>[3],
      flouci,
      undefined,
      new OrderAccessService(config),
    );
    return { service, orders, shipping, flouci };
  }

  const dto = {
    customerName: "Test Client",
    phone: "20123456",
    country: "TN",
    city: "Tunis",
    address: "Test street",
    payment: "flouci" as const,
    items: [{ productId: "shoe", size: 40, color: "black", qty: 2 }],
  };

  it("charges server product prices plus delivery and derives weight from quantity", async () => {
    const { service, flouci, shipping } = setup();
    const init = jest.spyOn(flouci, "initPayment").mockResolvedValue({
      paymentRef: "ref",
      payUrl: "https://checkout.flouci.com/ref",
    });
    const order = await service.create(dto);
    expect(shipping.quote).toHaveBeenCalledWith("TN", "LA_POSTE", 3);
    expect(order.total).toBe(order.subtotal + 8);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ amountTnd: order.total }),
    );
    expect(order.paymentStatus).toBe("pending");
  });

  it("rejects a changed total before creating a payment or order", async () => {
    const { service, orders, flouci } = setup();
    const init = jest.spyOn(flouci, "initPayment");
    await expect(
      service.create({ ...dto, expectedTotal: 200 }),
    ).rejects.toThrow("ont changé");
    expect(orders.save).not.toHaveBeenCalled();
    expect(init).not.toHaveBeenCalled();
  });

  it("includes the Aramex quote in the payment and keeps the destination postal details", async () => {
    const { service, flouci, shipping } = setup();
    shipping.quote.mockResolvedValue({
      country: "FR",
      zone: "EUROPE",
      price: 81.25,
    });
    const init = jest.spyOn(flouci, "initPayment").mockResolvedValue({
      paymentRef: "ref",
      payUrl: "https://checkout.flouci.com/ref",
    });
    const order = await service.create({
      ...dto,
      country: "FR",
      carrier: "ARAMEX",
      city: "Paris",
      postalCode: "75001",
      expectedTotal: 281.25,
    });
    expect(shipping.quote).toHaveBeenCalledWith("FR", "ARAMEX", 3);
    expect(order.delivery).toBe(81.25);
    expect(order.total).toBe(281.25);
    expect(order.address).toContain("75001");
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ amountTnd: 281.25 }),
    );
  });

  it("does not create an order or payment if the shipping rate is unavailable", async () => {
    const { service, orders, shipping, flouci } = setup();
    shipping.quote.mockRejectedValue(new Error("Aramex indisponible"));
    const init = jest.spyOn(flouci, "initPayment");
    await expect(
      service.create({ ...dto, country: "FR", carrier: "ARAMEX" }),
    ).rejects.toThrow("Aramex");
    expect(orders.save).not.toHaveBeenCalled();
    expect(init).not.toHaveBeenCalled();
  });

  it("blocks cash on delivery abroad", async () => {
    const { service } = setup();
    await expect(
      service.create({ ...dto, country: "FR", payment: "cod" }),
    ).rejects.toThrow("Tunisie");
  });

  it("does not issue a second payment link while a session is pending", async () => {
    const { service, flouci, orders } = setup();
    orders.findOne.mockResolvedValue({
      id: "order",
      payment: "flouci",
      paymentStatus: "pending",
      status: "paiement_en_cours",
      total: 107.5,
      paymentRef: "ref",
      payUrl: "https://checkout.flouci.com/ref",
    });
    jest.spyOn(flouci, "getPayment").mockResolvedValue({
      status: "PENDING",
      amount: 107500,
      developer_tracking_id: "order",
    });
    const init = jest.spyOn(flouci, "initPayment");
    const order = await service.retryPayment("order");
    expect(order.paymentRef).toBe("ref");
    expect(init).not.toHaveBeenCalled();
  });

  it("prevents shipping an unpaid Flouci order", async () => {
    const { service, orders } = setup();
    orders.findOne.mockResolvedValue({
      payment: "flouci",
      paymentStatus: "pending",
    });
    await expect(service.updateStatus("order", "en_livraison")).rejects.toThrow(
      "confirmé",
    );
  });

  it("confirms verified success without overwriting delivery status", async () => {
    const { service, orders, flouci } = setup();
    orders.findOne.mockResolvedValue({
      id: "order",
      payment: "flouci",
      paymentStatus: "pending",
      status: "paiement_en_cours",
      total: 107.5,
    });
    jest.spyOn(flouci, "getPayment").mockResolvedValue({
      status: "SUCCESS",
      amount: 107500,
      developer_tracking_id: "order",
    });
    expect(await service.confirmFlouci("ref")).toEqual({
      ok: true,
      paid: true,
      orderId: "order",
    });
    expect(orders.update).toHaveBeenCalledWith(
      { id: "order", paymentRef: "ref", paymentStatus: "pending" },
      { paymentStatus: "paid", status: "confirmee" },
    );
  });

  it("does not re-verify or downgrade an already paid order", async () => {
    const { service, orders, flouci } = setup();
    orders.findOne.mockResolvedValue({
      id: "order",
      payment: "flouci",
      paymentStatus: "paid",
    });
    const verify = jest.spyOn(flouci, "getPayment");
    expect(await service.confirmFlouci("ref")).toEqual({
      ok: true,
      paid: true,
      orderId: "order",
    });
    expect(verify).not.toHaveBeenCalled();
  });

  it("keeps the order readable when Flouci is unavailable during verification", async () => {
    const { service, orders, flouci } = setup();
    const order = {
      id: "order",
      payment: "flouci",
      paymentStatus: "pending",
      status: "paiement_en_cours",
      total: 107.5,
      paymentRef: "ref",
      items: [],
    };
    orders.findOne.mockResolvedValue(order);
    jest
      .spyOn(flouci, "getPayment")
      .mockRejectedValue(new Error("Flouci indisponible"));
    await expect(service.findOne("order")).resolves.toMatchObject({
      id: "order",
      paymentStatus: "pending",
    });
  });

  it("marks the order payment as failed and logs when the payment session cannot be opened", async () => {
    const { service, orders, flouci } = setup();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(flouci, "initPayment").mockRejectedValue(new Error("HTTP 401"));
    const order = await service.create(dto);
    expect(order.paymentStatus).toBe("failed");
    expect(orders.update).toHaveBeenCalledWith(
      { id: order.id, paymentStatus: "pending" },
      { paymentStatus: "failed" },
    );
    expect(warn).toHaveBeenCalledWith(
      "Flouci: ouverture du paiement impossible",
      expect.objectContaining({ orderId: order.id }),
    );
    warn.mockRestore();
  });

  it("rejects the retired Konnect payment type at order creation and for retries", async () => {
    const { service, orders } = setup();
    await expect(
      service.create({ ...dto, payment: "online" as never }),
    ).rejects.toThrow();
    orders.findOne.mockResolvedValue({
      id: "legacy",
      payment: "online",
      paymentStatus: "pending",
      status: "paiement_en_cours",
    });
    await expect(service.retryPayment("legacy")).rejects.toThrow(
      "n’est plus disponible",
    );
  });
});
