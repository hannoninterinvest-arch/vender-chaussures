import { ConfigService } from "../config";
import { AramexService, selectPackingRule } from "./aramex.service";

const rules = [
  { maxPairs: 1, lengthCm: 35, widthCm: 25, heightCm: 15 },
  { maxPairs: 2, lengthCm: 40, widthCm: 30, heightCm: 20 },
];
const settings = {
  ARAMEX_USERNAME: "test-user",
  ARAMEX_PASSWORD: "private-password",
  ARAMEX_ACCOUNT_NUMBER: "account",
  ARAMEX_ACCOUNT_PIN: "private-pin",
  ARAMEX_ACCOUNT_ENTITY: "TUN",
  ARAMEX_ORIGIN_CITY: "Tunis",
  ARAMEX_ORIGIN_ADDRESS: "Test street",
  ARAMEX_ORIGIN_POSTAL_CODE: "1000",
  ARAMEX_PACKAGING_RULES: JSON.stringify(rules),
};
const destination = {
  city: "Paris",
  postalCode: "75001",
  address: "Test address",
};
function response(amount = 80, currency = "TND") {
  return new Response(
    JSON.stringify({
      HasErrors: false,
      TotalAmount: { CurrencyCode: currency, Value: amount },
    }),
  );
}

describe("Aramex package weight", () => {
  it("uses volumetric weight for a light, bulky shoe box", () => {
    const result = selectPackingRule(rules, 1);
    expect(result.actualWeightKg).toBe(1.5);
    expect(result.volumetricWeightKg).toBe(2.625);
    expect(result.chargeableWeightKg).toBe(2.625);
  });
  it("uses real weight when it is higher than volumetric weight", () => {
    expect(
      selectPackingRule(
        [{ maxPairs: 2, lengthCm: 20, widthCm: 20, heightCm: 20 }],
        2,
      ).chargeableWeightKg,
    ).toBe(3);
  });
  it("selects the final two-pair carton rather than multiplying a single-box volume", () => {
    const result = selectPackingRule(rules, 2);
    expect(result.rule.maxPairs).toBe(2);
    expect(result.volumetricWeightKg).toBe(4.8);
    expect(result.chargeableWeightKg).toBe(4.8);
  });
  it("rejects unconfigured capacities and oversize packages", () => {
    expect(() => selectPackingRule(rules, 3)).toThrow("cette quantité");
    expect(() =>
      selectPackingRule(
        [{ maxPairs: 1, lengthCm: 100, widthCm: 100, heightCm: 100 }],
        1,
      ),
    ).toThrow("devis");
  });
});

describe("Aramex rate API", () => {
  afterEach(() => jest.restoreAllMocks());
  const service = new AramexService(new ConfigService(settings));
  it("asks Aramex for the destination-specific TND amount and preserves weight precision", async () => {
    const mock = jest.spyOn(global, "fetch").mockResolvedValue(response(81.25));
    const quote = await service.quote("FR", 1, destination);
    expect(quote.price).toBe(81.25);
    expect(quote.source).toBe("aramex-api");
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe(
      "https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate",
    );
    const body = JSON.parse(init?.body as string);
    expect(body.PreferredCurrencyCode).toBe("TND");
    expect(body.DestinationAddress).toMatchObject({
      CountryCode: "FR",
      City: "Paris",
      PostCode: "75001",
    });
    expect(body.ShipmentDetails).toMatchObject({
      ActualWeight: { Value: 1.5, Unit: "KG" },
      ChargeableWeight: { Value: 2.625, Unit: "KG" },
      NumberOfPieces: 1,
      Dimensions: { Length: 35, Width: 25, Height: 15, Unit: "CM" },
    });
    expect(JSON.stringify(quote)).not.toContain("private");
  });
  it("returns no guessed rate without valid credentials and package dimensions", async () => {
    const fetch = jest.spyOn(global, "fetch");
    const missing = new AramexService(new ConfigService());
    expect(missing.configured()).toBe(false);
    await expect(missing.quote("FR", 1, destination)).rejects.toThrow(
      "indisponible",
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(
      new AramexService(
        new ConfigService({ ...settings, ARAMEX_PACKAGING_RULES: "[]" }),
      ).configured(),
    ).toBe(false);
    expect(
      new AramexService(
        new ConfigService({
          ...settings,
          ARAMEX_PACKAGING_RULES: JSON.stringify([
            { ...rules[0], lengthCm: -5 },
          ]),
        }),
      ).configured(),
    ).toBe(false);
  });
  it("does not treat a foreign-currency amount as dinars", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(response(80, "EUR"));
    await expect(service.quote("FR", 1, destination)).rejects.toThrow("dinars");
  });
  it.each([0, -1])("refuses invalid quoted amount %s", async (value) => {
    jest.spyOn(global, "fetch").mockResolvedValue(response(value));
    await expect(service.quote("FR", 1, destination)).rejects.toThrow("dinars");
  });
  it("asks for the delivery city and handles address refusal", async () => {
    await expect(service.quote("FR", 1, {})).rejects.toThrow("ville");
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            HasErrors: true,
            Notifications: [{ Code: "ERR", Message: "private-account" }],
          }),
        ),
      );
    await expect(service.quote("FR", 1, destination)).rejects.toThrow(
      "Vérifiez",
    );
  });
  it("sanitizes upstream network errors", async () => {
    jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("private-password"));
    await expect(service.quote("FR", 1, destination)).rejects.toThrow(
      "temporairement indisponible",
    );
  });
});
