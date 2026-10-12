import {
  allowedStatuses,
  effectiveStatus,
  refundRequired,
} from "./order-workflow";
import { COUNTRY_LIST } from "./country-list";
import { allEstimatedRates } from "./country-shipping";
import { cartWeightKg } from "./shipping";
import { formatTnd } from "./format";
describe("Order workflow rules", () => {
  it("keeps cash orders unconfirmed until the phone call", () => {
    expect(
      effectiveStatus({
        status: "en_attente",
        payment: "cod",
        paymentStatus: "cod",
      }),
    ).toBe("en_attente");
    expect(
      allowedStatuses({
        status: "en_attente",
        payment: "cod",
        paymentStatus: "cod",
      }),
    ).toEqual(["confirmee", "annulee"]);
  });
  it("keeps unpaid online orders pending and prevents manual shipment/confirmation", () => {
    expect(
      allowedStatuses({
        status: "paiement_en_cours",
        payment: "flouci",
        paymentStatus: "pending",
      }),
    ).toEqual(["annulee"]);
    expect(
      allowedStatuses({
        status: "en_attente",
        payment: "online",
        paymentStatus: "failed",
      }),
    ).toEqual(["annulee"]);
  });
  it("recognizes legacy online-paid confirmations without reopening cancelled orders", () => {
    expect(
      effectiveStatus({
        status: "en_attente",
        payment: "online",
        paymentStatus: "paid",
      }),
    ).toBe("confirmee");
    expect(
      effectiveStatus({
        status: "annulee",
        payment: "online",
        paymentStatus: "paid",
      }),
    ).toBe("annulee");
  });
  it.each(["annulee", "retournee"])(
    "makes %s terminal and flags a received payment for refund handling",
    (status) => {
      expect(
        allowedStatuses({ status, payment: "cod", paymentStatus: "paid" }),
      ).toEqual([]);
      expect(
        refundRequired({ status, payment: "cod", paymentStatus: "paid" }),
      ).toBe(true);
      expect(
        refundRequired({ status, payment: "cod", paymentStatus: "cod" }),
      ).toBe(false);
    },
  );
  it("allows a courier return before collecting cash", () => {
    expect(
      allowedStatuses({
        status: "en_livraison",
        payment: "cod",
        paymentStatus: "cod",
      }),
    ).toEqual(["livree", "retournee"]);
  });
});
describe("Worldwide rates and checkout amounts", () => {
  it("provides one editable estimate per foreign ISO country and carrier", () => {
    expect(COUNTRY_LIST).toHaveLength(249);
    const rates = allEstimatedRates();
    expect(new Set(rates.map((row) => row.id)).size).toBe(498);
    expect(rates.filter((row) => row.countryCode !== "TN")).toHaveLength(496);
    expect(
      rates
        .filter((row) => row.countryCode !== "TN")
        .every((row) => row.estimated && row.basePriceTND > 0),
    ).toBe(true);
  });
  it("uses 1.5kg per pair and preserves fractional amounts on screen", () => {
    expect(cartWeightKg(3)).toBe(4.5);
    expect(formatTnd(281.25)).toMatch(/281[,.]25/);
  });
});
