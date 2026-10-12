import { AramexService } from "./aramex.service";
import { ConfigService } from "../config";
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
  it("uses the live Aramex quote rather than obsolete estimated rates", async () => {
    const rates = { find: jest.fn() };
    const aramex = new AramexService(new ConfigService());
    const api = jest
      .spyOn(aramex, "quote")
      .mockResolvedValue({
        price: 90,
        actualWeightKg: 3,
        volumetricWeightKg: 4.8,
        chargeableWeightKg: 4.8,
        rule: { maxPairs: 2, lengthCm: 40, widthCm: 30, heightCm: 20 },
        source: "aramex-api",
      });
    const service = new ShippingService(
      rates as unknown as ConstructorParameters<typeof ShippingService>[0],
      aramex,
    );
    const destination = { city: "Paris", postalCode: "75001" };
    const quote = await service.quote("FR", "ARAMEX", 3, destination);
    expect(api).toHaveBeenCalledWith("FR", 2, destination);
    expect(quote.price).toBe(90);
    expect(quote).toMatchObject({ chargeableWeightKg: 4.8 });
    expect(rates.find).not.toHaveBeenCalled();
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
