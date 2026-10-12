import { COUNTRY_LIST } from "@/lib/country-list";
import {
  allEstimatedRates,
  estimatedCountryRate,
  SHIPPING_CARRIERS,
  type ShippingCarrier,
  type CountryRate,
} from "@/lib/country-shipping";
import { CommerceStore } from "../commerce-store";
import { BadRequestException, NotFoundException } from "../http";
import { UpdateCountryRateDto } from "./dto/update-country-rate.dto";
import { roundMoney } from "./shipping-quote";
export class CountryRatesService {
  constructor(private readonly store: CommerceStore) {}
  async list() {
    const stored = await this.store.list<CountryRate>("shipping:");
    const overrides = new Map(stored.map((row) => [row.id, row]));
    return allEstimatedRates().map((row) => overrides.get(row.id) || row);
  }
  async get(code: string, carrier: ShippingCarrier) {
    return (
      (await this.store.get<CountryRate>(`shipping:${carrier}:${code}`)) ||
      estimatedCountryRate(code, carrier)
    );
  }
  async update(id: string, dto: UpdateCountryRateDto) {
    const [carrier, code] = id.split(":");
    if (
      !SHIPPING_CARRIERS.includes(carrier as ShippingCarrier) ||
      !COUNTRY_LIST.some((c) => c.code === code)
    )
      throw new NotFoundException("Tarif introuvable");
    if (code === "TN")
      throw new BadRequestException(
        "La livraison en Tunisie reste à 8 DT par commande.",
      );
    if (dto.enabled && dto.basePriceTND === 0 && dto.pricePerExtraKgTND === 0)
      throw new BadRequestException(
        "Renseignez un tarif avant d’activer la destination.",
      );
    const row: CountryRate = {
      ...estimatedCountryRate(code, carrier as ShippingCarrier),
      ...dto,
      basePriceTND: roundMoney(dto.basePriceTND),
      weightIncludedKg: roundMoney(dto.weightIncludedKg),
      pricePerExtraKgTND: roundMoney(dto.pricePerExtraKgTND),
      updatedAt: new Date().toISOString(),
    };
    await this.store.put(`shipping:${id}`, row);
    return row;
  }
}
