import { Repository } from "typeorm";
import { UpdateSiteDto } from "./dto/update-site.dto";
import { SiteSettings } from "./site-settings.entity";
import { homepageCovers, legacyHomepageCovers } from "../products/catalog";

const HOME_ID = "home";
const DEFAULT_SUBTITLE =
  "L'élégance du cuir, pensée pour la ville et la cérémonie.";

/** Migrer uniquement le carrousel par défaut, sans écraser les choix de l'administrateur. */
function hasLegacyHomepageCovers(covers: string[] | undefined | null) {
  return (
    Array.isArray(covers) &&
    covers.length === legacyHomepageCovers.length &&
    covers.every((url, index) => url === legacyHomepageCovers[index])
  );
}

export class SiteService {
  constructor(private readonly rows: Repository<SiteSettings>) {}

  async onModuleInit() {
    await this.ensure();
  }

  async getHome() {
    const row = await this.ensure();
    return this.toClient(row);
  }

  async updateHome(dto: UpdateSiteDto) {
    const row = await this.ensure();
    if (dto.heroKicker !== undefined) row.heroKicker = dto.heroKicker.trim();
    if (dto.heroTitle !== undefined) row.heroTitle = dto.heroTitle.trim();
    if (dto.heroSubtitle !== undefined)
      row.heroSubtitle = dto.heroSubtitle.trim();
    if (dto.coverImages !== undefined) {
      row.coverImages = dto.coverImages
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, 8);
    }
    return this.toClient(await this.rows.save(row));
  }

  private async ensure() {
    const row = await this.rows.findOne({ where: { id: HOME_ID } });
    if (row) {
      if (hasLegacyHomepageCovers(row.coverImages)) {
        row.coverImages = [...homepageCovers];
        return this.rows.save(row);
      }
      return row;
    }
    return this.rows.save(
      this.rows.create({
        id: HOME_ID,
        heroKicker: "Collection",
        heroTitle: "CUIR PREMIUM",
        heroSubtitle: DEFAULT_SUBTITLE,
        coverImages: homepageCovers,
      }),
    );
  }

  private toClient(row: SiteSettings) {
    return {
      heroKicker: row.heroKicker || "Collection",
      heroTitle: row.heroTitle || "CUIR PREMIUM",
      heroSubtitle: row.heroSubtitle || DEFAULT_SUBTITLE,
      coverImages: Array.isArray(row.coverImages)
        ? row.coverImages.filter(Boolean)
        : [],
    };
  }
}
