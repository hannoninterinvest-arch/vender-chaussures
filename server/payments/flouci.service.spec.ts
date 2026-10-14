import { createHmac } from "node:crypto";
import { ConfigService } from "@/server/config";
import { FlouciService } from "./flouci.service";

describe("FlouciService", () => {
  const config = new ConfigService({
    FLOUCI_PUBLIC_KEY: "test-public",
    FLOUCI_SECRET_KEY: "test-secret",
  });
  const service = new FlouciService(config);
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

  it("does not depend on any other payment provider for callback URLs", async () => {
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
    const local = new FlouciService(
      new ConfigService({
        FLOUCI_PUBLIC_KEY: "p",
        FLOUCI_SECRET_KEY: "s",
        APP_URL: "https://shop.example/",
      }),
    );
    await local.initPayment({ orderId: "KCK-1", accessToken: "tok", amountTnd: 10 });
    expect(JSON.parse(mock.mock.calls[0][1]?.body as string)).toMatchObject({
      success_link: "https://shop.example/commande/KCK-1?paid=1#token=tok",
      fail_link: "https://shop.example/commande/KCK-1?paid=0#token=tok",
      webhook: "https://shop.example/api/payments/flouci/webhook",
    });
  });

  it("refuses a non-HTTPS public URL in production", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    const production = new FlouciService(
      new ConfigService({
        FLOUCI_PUBLIC_KEY: "p",
        FLOUCI_SECRET_KEY: "s",
        APP_URL: "http://shop.example",
        NODE_ENV: "production",
      }),
    );
    await expect(
      production.initPayment({ orderId: "KCK-1", amountTnd: 10 }),
    ).rejects.toThrow("HTTPS");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects links outside flouci.com and logs rejected credentials without leaking them", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          result: { success: true, payment_id: "ref", link: "https://evil.example/pay" },
        }),
      ),
    );
    await expect(
      service.initPayment({ orderId: "order", amountTnd: 10 }),
    ).rejects.toThrow("Lien de paiement Flouci invalide");
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ result: { status: 401, message: "Unauthorized" } }), { status: 401 }),
    );
    await expect(service.getPayment("ref")).rejects.toThrow("temporairement indisponible");
    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain("HTTP 401");
    expect(logged).toContain("FLOUCI_PUBLIC_KEY");
    expect(logged).not.toContain("test-secret");
    expect(logged).not.toContain("test-public");
  });

  describe("webhook signature", () => {
    const sign = (t: number, payload: string, key = "test-secret") =>
      `t=${t},v1=${createHmac("sha256", key).update(`${t}.${payload}`).digest("hex")}`;
    const now = 1_800_000_000_000;
    const t = now / 1000;
    const params = { paymentId: "abc", success: "True" };
    const payload = "payment_id=abc&success=True";

    it("accepts a fresh signature made with the private key", () => {
      expect(() =>
        service.verifyWebhook(params, sign(t, payload), now),
      ).not.toThrow();
    });

    it.each([
      ["missing header", null],
      ["garbage header", "t=abc,v1=zz"],
      ["wrong key", sign(t, payload, "other")],
      ["tampered payload", sign(t, "payment_id=abc&success=False")],
      ["replayed timestamp", sign(t - 3600, payload)],
    ])("rejects %s", (_name, header) => {
      expect(() => service.verifyWebhook(params, header, now)).toThrow(
        "Signature Flouci invalide",
      );
    });
  });
});
