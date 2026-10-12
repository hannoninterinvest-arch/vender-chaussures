import { ConfigService } from "../config";
import { BadRequestException, ServiceUnavailableException } from "../http";
import {
  ARAMEX_VOLUMETRIC_DIVISOR,
  PAIR_WEIGHT_KG,
} from "@/lib/shipping-config";
import { roundMoney } from "./shipping-quote";

export type ShippingDestination = {
  city?: string;
  postalCode?: string;
  stateProvinceCode?: string;
  address?: string;
};
export type PackingRule = {
  maxPairs: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

/** Dimensions are supplied by the merchant for the FINAL packed carton, never guessed. */
export function selectPackingRule(rules: PackingRule[], pairs: number) {
  if (!Number.isSafeInteger(pairs) || pairs < 1)
    throw new BadRequestException("Nombre de paires invalide");
  const rule = rules
    .slice()
    .sort((a, b) => a.maxPairs - b.maxPairs)
    .find((box) => box.maxPairs >= pairs);
  if (!rule)
    throw new ServiceUnavailableException(
      "Livraison Aramex indisponible pour cette quantité. Contactez-nous pour un devis.",
    );
  const actualWeightKg = PAIR_WEIGHT_KG * pairs;
  const volumetricWeightKg =
    (rule.lengthCm * rule.widthCm * rule.heightCm) / ARAMEX_VOLUMETRIC_DIVISOR;
  const chargeableWeightKg = Math.max(actualWeightKg, volumetricWeightKg);
  if (chargeableWeightKg > 30)
    throw new BadRequestException(
      "Ce colis nécessite un devis de transport spécifique. Contactez-nous.",
    );
  // Do not round to a guessed weight bracket. Aramex applies its contractual brackets.
  return { rule, actualWeightKg, volumetricWeightKg, chargeableWeightKg };
}

export class AramexService {
  constructor(private readonly config: ConfigService) {}
  private value(name: string) {
    return this.config.get<string>(name)?.trim() || "";
  }

  private packingRules(): PackingRule[] {
    let rules: unknown;
    try {
      rules = JSON.parse(this.value("ARAMEX_PACKAGING_RULES"));
    } catch {
      throw new ServiceUnavailableException(
        "Livraison Aramex temporairement indisponible.",
      );
    }
    if (!Array.isArray(rules) || !rules.length || rules.length > 30)
      throw new ServiceUnavailableException(
        "Livraison Aramex temporairement indisponible.",
      );
    const valid = rules.every(
      (rule) =>
        rule &&
        Number.isSafeInteger(rule.maxPairs) &&
        rule.maxPairs >= 1 &&
        rule.maxPairs <= 20 &&
        ["lengthCm", "widthCm", "heightCm"].every(
          (key) =>
            typeof rule[key] === "number" &&
            Number.isFinite(rule[key]) &&
            rule[key] > 0 &&
            rule[key] <= 100,
        ),
    );
    if (
      !valid ||
      new Set(rules.map((rule) => rule.maxPairs)).size !== rules.length
    )
      throw new ServiceUnavailableException(
        "Livraison Aramex temporairement indisponible.",
      );
    return rules;
  }

  configured() {
    const ready = [
      "ARAMEX_USERNAME",
      "ARAMEX_PASSWORD",
      "ARAMEX_ACCOUNT_NUMBER",
      "ARAMEX_ACCOUNT_PIN",
      "ARAMEX_ACCOUNT_ENTITY",
      "ARAMEX_ORIGIN_CITY",
      "ARAMEX_ORIGIN_ADDRESS",
    ].every((key) => this.value(key));
    if (!ready) return false;
    try {
      this.packingRules();
      return true;
    } catch {
      return false;
    }
  }

  async quote(
    country: string,
    pairs: number,
    destination: ShippingDestination,
  ) {
    if (!this.configured())
      throw new ServiceUnavailableException(
        "Livraison Aramex temporairement indisponible. Choisissez un autre transporteur.",
      );
    if (!destination.city?.trim())
      throw new BadRequestException(
        "Saisissez votre ville pour calculer la livraison Aramex.",
      );
    const packing = selectPackingRule(this.packingRules(), pairs);
    const body = {
      ClientInfo: {
        UserName: this.value("ARAMEX_USERNAME"),
        Password: this.value("ARAMEX_PASSWORD"),
        Version: "v1.0",
        AccountNumber: this.value("ARAMEX_ACCOUNT_NUMBER"),
        AccountPin: this.value("ARAMEX_ACCOUNT_PIN"),
        AccountEntity: this.value("ARAMEX_ACCOUNT_ENTITY"),
        AccountCountryCode: "TN",
      },
      Transaction: { Reference1: "ELVARO-delivery-quote" },
      OriginAddress: {
        CountryCode: "TN",
        City: this.value("ARAMEX_ORIGIN_CITY"),
        PostCode: this.value("ARAMEX_ORIGIN_POSTAL_CODE"),
        Line1: this.value("ARAMEX_ORIGIN_ADDRESS").slice(0, 50),
      },
      DestinationAddress: {
        CountryCode: country,
        City: destination.city.trim(),
        PostCode: destination.postalCode?.trim() || "",
        StateOrProvinceCode: destination.stateProvinceCode?.trim() || "",
        Line1:
          destination.address?.trim().slice(0, 50) || destination.city.trim(),
      },
      ShipmentDetails: {
        Dimensions: {
          Length: packing.rule.lengthCm,
          Width: packing.rule.widthCm,
          Height: packing.rule.heightCm,
          Unit: "CM",
        },
        ActualWeight: { Value: packing.actualWeightKg, Unit: "KG" },
        ChargeableWeight: { Value: packing.chargeableWeightKg, Unit: "KG" },
        NumberOfPieces: 1,
        ProductGroup: "EXP",
        ProductType: this.value("ARAMEX_PRODUCT_TYPE") || "PPX",
        PaymentType: "P",
        PaymentOptions: "ACCT",
        Services: "",
        DescriptionOfGoods: "Shoes",
        GoodsOriginCountry: "TN",
      },
      PreferredCurrencyCode: "TND",
    };
    const host =
      this.value("ARAMEX_SANDBOX") === "true"
        ? "ws.dev.aramex.net"
        : "ws.aramex.net";
    // Aramex Rate Calculator API: read-only quotation, no shipment booking.
    let data: {
      HasErrors?: boolean;
      TotalAmount?: { CurrencyCode?: string; Value?: number };
      Notifications?: { Code?: string }[];
    };
    try {
      const res = await fetch(
        `https://${host}/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
          cache: "no-store",
          signal: AbortSignal.timeout(12000),
        },
      );
      if (!res.ok) throw new Error("Aramex HTTP error");
      data = await res.json();
    } catch {
      throw new ServiceUnavailableException(
        "Aramex est temporairement indisponible. Réessayez ou choisissez un autre transporteur.",
      );
    }
    const value = data?.TotalAmount?.Value;
    if (data?.HasErrors === true)
      throw new BadRequestException(
        "Aramex ne propose pas de tarif pour cette adresse. Vérifiez la ville, le code postal et la région.",
      );
    // Never treat a foreign currency, malformed response or zero/negative quote as TND.
    if (
      data?.HasErrors !== false ||
      data.TotalAmount?.CurrencyCode !== "TND" ||
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      throw new ServiceUnavailableException(
        "Le tarif Aramex n’est pas disponible en dinars tunisiens. Contactez-nous.",
      );
    }
    return {
      price: roundMoney(value),
      ...packing,
      source: "aramex-api" as const,
    };
  }
}
