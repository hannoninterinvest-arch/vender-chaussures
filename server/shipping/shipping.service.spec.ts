import { ShippingService } from "./shipping.service";

describe("ShippingService", () => {
  it("charges 8 DT in Tunisia for both carriers despite legacy rates", async () => {
    const rates = {
      find: jest.fn(async () => [
        {
          carrier: "LA_POSTE",
          zone: "TUNISIE",
          isLocal: true,
          basePriceTND: 7.5,
        },
      ]),
    };
    const service = new ShippingService(
      rates as unknown as ConstructorParameters<typeof ShippingService>[0],
    );
    expect((await service.quote("TN", "LA_POSTE", 1.5)).price).toBe(8);
    expect((await service.quote("TN", "ARAMEX", 6)).price).toBe(8);
    expect(rates.find).not.toHaveBeenCalled();
  });
  it("continues to read current La Poste rates for international quotes", async () => {
    const rows = [
      {
        carrier: "LA_POSTE",
        zone: "EUROPE",
        isLocal: false,
        basePriceTND: 45,
        weightIncludedKg: 1,
        pricePerExtraKgTND: 10,
      },
    ];
    const rates = { find: jest.fn(async () => rows) };
    const service = new ShippingService(
      rates as unknown as ConstructorParameters<typeof ShippingService>[0],
    );
    expect((await service.quote("FR", "LA_POSTE", 3)).price).toBe(65);
    rows[0].basePriceTND = 50;
    expect((await service.quote("FR", "LA_POSTE", 3)).price).toBe(70);
  });
  it("uses the configured Aramex tariff and a fixed weight without an external API", async () => {
    const rows = [
      {
        carrier: "ARAMEX",
        zone: "EUROPE",
        isLocal: false,
        basePriceTND: 90,
        weightIncludedKg: 0.5,
        pricePerExtraKgTND: 20,
      },
    ];
    const rates = { find: jest.fn(async () => rows) };
    const fetch = jest.spyOn(global, "fetch");
    try {
      const service = new ShippingService(
        rates as unknown as ConstructorParameters<typeof ShippingService>[0],
      );
      const quote = await service.quote("FR", "ARAMEX", 3);
      expect(quote).toMatchObject({
        price: 140,
        weightKg: 3,
        pairWeightKg: 1.5,
        source: "admin-table",
      });
      expect(fetch).not.toHaveBeenCalled();
      rows[0].pricePerExtraKgTND = 25;
      expect((await service.quote("FR", "ARAMEX", 3)).price).toBe(152.5);
    } finally {
      fetch.mockRestore();
    }
  });

  it("requires an admin tariff when no Aramex rate exists for the destination zone", async () => {
    const rates = { find: jest.fn(async () => []) };
    const service = new ShippingService(
      rates as unknown as ConstructorParameters<typeof ShippingService>[0],
    );
    await expect(service.quote("FR", "ARAMEX", 1.5)).rejects.toThrow(
      "Aucun tarif",
    );
  });

  it.each([NaN, Infinity, 0, -1, 80.8])(
    "rejects invalid weight %s",
    async (weight) => {
      const service = new ShippingService({
        find: jest.fn(),
      } as unknown as ConstructorParameters<typeof ShippingService>[0]);
      await expect(service.quote("TN", "LA_POSTE", weight)).rejects.toThrow(
        "poids",
      );
    },
  );
  it("rejects unknown names instead of silently truncating them to TN", async () => {
    const service = new ShippingService({
      find: jest.fn(),
    } as unknown as ConstructorParameters<typeof ShippingService>[0]);
    await expect(service.quote("TN-invalid", "LA_POSTE", 0.8)).rejects.toThrow(
      "Pays",
    );
  });
});
