import { ConfigService } from "@/server/config";
import { KonnectService } from "./konnect.service";

describe("KonnectService", () => {
  const service = new KonnectService(
    new ConfigService({ KONNECT_API_KEY: "test", KONNECT_WALLET_ID: "wallet" }),
  );
  afterEach(() => jest.restoreAllMocks());
  it("rejects a successful transaction inside an incomplete payment", () => {
    expect(
      service.isPaid(
        { status: "pending", transactions: [{ status: "success" }] },
        "order",
        100,
      ),
    ).toBe(false);
  });
  it("checks final status, order, currency and collected amount", () => {
    const payment = {
      status: "completed",
      orderId: "order",
      token: "TND",
      amount: 107500,
      reachedAmount: 107500,
    };
    expect(service.isPaid(payment, "order", 107.5)).toBe(true);
    expect(
      service.isPaid({ ...payment, reachedAmount: 100000 }, "order", 107.5),
    ).toBe(false);
    expect(service.isPaid({ ...payment, token: "EUR" }, "order", 107.5)).toBe(
      false,
    );
    expect(service.isPaid(payment, "other", 107.5)).toBe(false);
  });
  it("does not send unsupported Flouci methods to Konnect", async () => {
    const mock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            paymentRef: "ref",
            payUrl: "https://pay.konnect.network/ref",
          }),
        ),
      );
    await service.initPayment({
      orderId: "order",
      amountTnd: 107.5,
      customerName: "Test Client",
      phone: "20123456",
    });
    expect(
      JSON.parse(mock.mock.calls[0][1]?.body as string).acceptedPaymentMethods,
    ).toEqual(["wallet", "bank_card", "e-DINAR"]);
  });
});
