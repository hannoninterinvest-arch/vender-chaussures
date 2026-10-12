import { ConfigService } from "@/server/config";
import { FlouciService } from "./flouci.service";
import { KonnectService } from "./konnect.service";

describe("FlouciService", () => {
  const config = new ConfigService({
    FLOUCI_PUBLIC_KEY: "test-public",
    FLOUCI_SECRET_KEY: "test-secret",
  });
  const service = new FlouciService(config, new KonnectService(config));
  afterEach(() => jest.restoreAllMocks());

  it("creates a v2 payment for the entire total in millimes", async () => {
    const mock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            result: {
              success: true,
              payment_id: "ref",
              link: "https://checkout.flouci.com/shop/ref",
            },
          }),
        ),
      );
    expect(
      await service.initPayment({ orderId: "order", amountTnd: 107.5 }),
    ).toEqual({
      paymentRef: "ref",
      payUrl: "https://checkout.flouci.com/shop/ref",
    });
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe("https://developers.flouci.com/api/v2/generate_payment");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer test-public:test-secret",
    });
    expect(JSON.parse(init?.body as string)).toMatchObject({
      amount: "107500",
      developer_tracking_id: "order",
      webhook_version: 1,
    });
  });

  it("requires API success before using verification data", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            result: { status: "SUCCESS", amount: 107500 },
          }),
        ),
      );
    expect(await service.getPayment("ref")).toBeNull();
  });

  it("accepts only final success for the correct order and total", () => {
    const payment = {
      status: "SUCCESS",
      amount: 107500,
      developer_tracking_id: "order",
    };
    expect(service.isPaid(payment, "order", 107.5)).toBe(true);
    expect(service.isPaid({ ...payment, amount: 100000 }, "order", 107.5)).toBe(
      false,
    );
    expect(service.isPaid(payment, "other", 107.5)).toBe(false);
    expect(
      service.isPaid({ ...payment, status: "PENDING" }, "order", 107.5),
    ).toBe(false);
    expect(
      service.isPaid({ ...payment, status: "PREAUTH_SUCCESS" }, "order", 107.5),
    ).toBe(false);
  });

  it("handles network errors without leaking credentials", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("test-secret"));
    await expect(
      service.initPayment({ orderId: "order", amountTnd: 107.5 }),
    ).rejects.toThrow("Flouci est temporairement indisponible");
  });
});
