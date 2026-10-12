import { BadRequestException, NotFoundException } from "@/server/http";
import { Repository } from "typeorm";
import { CreateShippingRateDto } from "./dto/create-shipping-rate.dto";
import { UpdateShippingRateDto } from "./dto/update-shipping-rate.dto";
import { quoteShippingPrice, roundMoney } from "./shipping-quote";
import { ShippingRate } from "./shipping-rate.entity";
import {
  PAIR_WEIGHT_KG,
  LOCAL_DELIVERY_TND,
  defaultShippingRateSeeds,
  isTunisia,
  normalizeCountryCode,
  zoneForCountry,
  type ShippingCarrier,
} from "./shipping-rates.config";

import { AramexService, type ShippingDestination } from "./aramex.service";
import { ConfigService } from "../config";

export class ShippingService {
  constructor(
    private readonly rates: Repository<ShippingRate>,
    private readonly aramex = new AramexService(new ConfigService()),
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  /** Insère les estimations manquantes sans écraser les tarifs déjà édités par l’admin. */
  async seedDefaults() {
    const existing = await this.rates.find();
    const keys = new Set(existing.map((row) => `${row.carrier}:${row.zone}`));
    const missing = defaultShippingRateSeeds().filter(
      (row) => !keys.has(`${row.carrier}:${row.zone}`),
    );
    if (missing.length === 0) return;
    await this.rates.save(missing.map((row) => this.rates.create(row)));
  }

  async listRates() {
    const rows = await this.loadRates();
    return rows
      .slice()
      .sort(
        (a, b) =>
          a.zone.localeCompare(b.zone) || a.carrier.localeCompare(b.carrier),
      )
      .map((row) => this.toClient(row));
  }

  async createRate(dto: CreateShippingRateDto) {
    if (dto.carrier === "ARAMEX" && dto.zone !== "TUNISIE")
      throw new BadRequestException(
        "Aramex international utilise les devis de son API.",
      );
    const isLocal = dto.zone === "TUNISIE";
    const row = this.rates.create({
      carrier: dto.carrier,
      zone: dto.zone,
      isLocal,
      basePriceTND: isLocal ? LOCAL_DELIVERY_TND : roundMoney(dto.basePriceTND),
      weightIncludedKg: roundMoney(dto.weightIncludedKg ?? (isLocal ? 0 : 0.5)),
      pricePerExtraKgTND: roundMoney(dto.pricePerExtraKgTND ?? 0),
    });
    row.isLocal = row.zone === "TUNISIE";
    if (row.isLocal) {
      row.basePriceTND = LOCAL_DELIVERY_TND;
      row.weightIncludedKg = 0;
      row.pricePerExtraKgTND = 0;
    }
    try {
      const saved = await this.rates.save(row);
      return this.toClient(saved);
    } catch {
      throw new BadRequestException(
        `Un tarif existe déjà pour ${dto.carrier} / ${dto.zone}. Modifie-le plutôt.`,
      );
    }
  }

  async updateRate(id: string, dto: UpdateShippingRateDto) {
    const row = await this.rates.findOne({ where: { id } });
    if (!row) throw new NotFoundException("Tarif introuvable");
    if (dto.carrier !== undefined) row.carrier = dto.carrier;
    if (dto.zone !== undefined) row.zone = dto.zone;
    if (row.carrier === "ARAMEX" && row.zone !== "TUNISIE")
      throw new BadRequestException(
        "Aramex international utilise les devis de son API.",
      );
    if (dto.basePriceTND !== undefined)
      row.basePriceTND = roundMoney(dto.basePriceTND);
    if (dto.weightIncludedKg !== undefined) {
      row.weightIncludedKg = roundMoney(dto.weightIncludedKg);
    }
    if (dto.pricePerExtraKgTND !== undefined) {
      row.pricePerExtraKgTND = roundMoney(dto.pricePerExtraKgTND);
    }
    row.isLocal = row.zone === "TUNISIE";
    if (row.isLocal) {
      row.basePriceTND = LOCAL_DELIVERY_TND;
      row.weightIncludedKg = 0;
      row.pricePerExtraKgTND = 0;
    }
    try {
      const saved = await this.rates.save(row);
      return this.toClient(saved);
    } catch {
      throw new BadRequestException(
        `Un tarif existe déjà pour ${row.carrier} / ${row.zone}.`,
      );
    }
  }

  async calculateShippingCost(
    country: string,
    carrier: ShippingCarrier,
    weightKg: number,
  ): Promise<number> {
    const quote = await this.quote(country, carrier, weightKg);
    return quote.price;
  }

  async quote(
    country: string,
    carrier: ShippingCarrier,
    weightKg: number,
    destination: ShippingDestination = {},
  ) {
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 80) {
      throw new BadRequestException(
        "Le poids du colis doit être compris entre 0 et 80 kg.",
      );
    }
    const code = normalizeCountryCode(country);
    if (!/^[A-Z]{2}$/.test(code))
      throw new BadRequestException(
        "Pays de livraison invalide. Utilise un code ISO à deux lettres.",
      );
    const zone = zoneForCountry(code);
    const local = isTunisia(code);
    const common = {
      currency: "TND" as const,
      country: code,
      carrier,
      zone,
      isLocal: local,
      weightKg,
      pairWeightKg: PAIR_WEIGHT_KG,
    };
    if (local)
      return {
        ...common,
        price: LOCAL_DELIVERY_TND,
        source: "local-flat" as const,
      };
    if (carrier === "ARAMEX") {
      const pairs = weightKg / PAIR_WEIGHT_KG;
      if (!Number.isSafeInteger(pairs))
        throw new BadRequestException(
          "Poids incohérent avec le nombre de paires.",
        );
      const result = await this.aramex.quote(code, pairs, destination);
      return {
        ...common,
        price: result.price,
        actualWeightKg: result.actualWeightKg,
        volumetricWeightKg: result.volumetricWeightKg,
        chargeableWeightKg: result.chargeableWeightKg,
        source: result.source,
      };
    }
    const rows = await this.loadRates();
    const rate = rows.find(
      (row) =>
        row.carrier === carrier && row.zone === zone && row.isLocal === local,
    );
    if (!rate) {
      throw new BadRequestException(
        `Aucun tarif ${carrier} pour la zone ${zone}. Ajoute-le dans l’admin livraison.`,
      );
    }
    const kg = Math.max(0, Number(weightKg) || 0);
    const price = quoteShippingPrice(rate, kg);
    return {
      price,
      currency: "TND" as const,
      country: code,
      carrier,
      zone: rate.zone,
      isLocal: rate.isLocal,
      weightKg: kg,
      pairWeightKg: PAIR_WEIGHT_KG,
    };
  }

  info() {
    return {
      pairWeightKg: PAIR_WEIGHT_KG,
      carriers: [
        { id: "ARAMEX", label: "Aramex" },
        { id: "LA_POSTE", label: "La Poste" },
      ],
      zones: [
        { id: "TUNISIE", label: "Tunisie (local)" },
        { id: "MAGHREB", label: "Maghreb" },
        { id: "EUROPE", label: "Europe" },
        { id: "MOYEN_ORIENT", label: "Moyen-Orient" },
        { id: "AMERIQUE_NORD", label: "Amérique du Nord" },
        { id: "RESTE_MONDE", label: "Reste du monde" },
      ],
      estimates: true,
      localDeliveryTND: LOCAL_DELIVERY_TND,
      aramexReady: this.aramex.configured(),
    };
  }

  private async loadRates(): Promise<ShippingRate[]> {
    // Always read current admin rates across backend instances.
    return this.rates.find();
  }

  private toClient(row: ShippingRate) {
    return {
      id: row.id,
      carrier: row.carrier,
      zone: row.zone,
      isLocal: row.isLocal,
      basePriceTND:
        row.zone === "TUNISIE" ? LOCAL_DELIVERY_TND : Number(row.basePriceTND),
      weightIncludedKg: Number(row.weightIncludedKg),
      pricePerExtraKgTND: Number(row.pricePerExtraKgTND),
      updatedAt: row.updatedAt,
    };
  }
}
