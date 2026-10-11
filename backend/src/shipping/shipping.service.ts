import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { quoteShippingPrice, roundMoney } from './shipping-quote';
import { ShippingRate } from './shipping-rate.entity';
import {
  PAIR_WEIGHT_KG,
  defaultShippingRateSeeds,
  isTunisia,
  normalizeCountryCode,
  zoneForCountry,
  type ShippingCarrier,
} from './shipping-rates.config';


@Injectable()
export class ShippingService implements OnModuleInit {

  constructor(
    @InjectRepository(ShippingRate)
    private readonly rates: Repository<ShippingRate>,
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
      .sort((a, b) => a.zone.localeCompare(b.zone) || a.carrier.localeCompare(b.carrier))
      .map((row) => this.toClient(row));
  }

  async createRate(dto: CreateShippingRateDto) {
    const isLocal = dto.isLocal ?? dto.zone === 'TUNISIE';
    const row = this.rates.create({
      carrier: dto.carrier,
      zone: dto.zone,
      isLocal,
      basePriceTND: roundMoney(dto.basePriceTND),
      weightIncludedKg: roundMoney(dto.weightIncludedKg ?? (isLocal ? 0 : 0.5)),
      pricePerExtraKgTND: roundMoney(dto.pricePerExtraKgTND ?? 0),
    });
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
    if (!row) throw new NotFoundException('Tarif introuvable');
    if (dto.carrier !== undefined) row.carrier = dto.carrier;
    if (dto.zone !== undefined) row.zone = dto.zone;
    if (dto.isLocal !== undefined) row.isLocal = dto.isLocal;
    if (dto.basePriceTND !== undefined) row.basePriceTND = roundMoney(dto.basePriceTND);
    if (dto.weightIncludedKg !== undefined) {
      row.weightIncludedKg = roundMoney(dto.weightIncludedKg);
    }
    if (dto.pricePerExtraKgTND !== undefined) {
      row.pricePerExtraKgTND = roundMoney(dto.pricePerExtraKgTND);
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

  async quote(country: string, carrier: ShippingCarrier, weightKg: number) {
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 80) {
      throw new BadRequestException('Le poids du colis doit être compris entre 0 et 80 kg.');
    }
    const code = normalizeCountryCode(country);
    if (!/^[A-Z]{2}$/.test(code)) throw new BadRequestException('Pays de livraison invalide. Utilise un code ISO à deux lettres.');
    const zone = zoneForCountry(code);
    const local = isTunisia(code);
    const rows = await this.loadRates();
    const rate = rows.find(
      (row) =>
        row.carrier === carrier &&
        row.zone === zone && row.isLocal === local,
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
      currency: 'TND' as const,
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
        { id: 'ARAMEX', label: 'Aramex' },
        { id: 'LA_POSTE', label: 'La Poste' },
      ],
      zones: [
        { id: 'TUNISIE', label: 'Tunisie (local)' },
        { id: 'MAGHREB', label: 'Maghreb' },
        { id: 'EUROPE', label: 'Europe' },
        { id: 'MOYEN_ORIENT', label: 'Moyen-Orient' },
        { id: 'AMERIQUE_NORD', label: 'Amérique du Nord' },
        { id: 'RESTE_MONDE', label: 'Reste du monde' },
      ],
      estimates: true,
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
      basePriceTND: Number(row.basePriceTND),
      weightIncludedKg: Number(row.weightIncludedKg),
      pricePerExtraKgTND: Number(row.pricePerExtraKgTND),
      updatedAt: row.updatedAt,
    };
  }
}
