import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteSettings } from './site-settings.entity';
import { homepageCovers } from '../products/catalog';
import { isSeedMedia } from '../products/product-media';

const HOME_ID = 'home';
const DEFAULT_SUBTITLE =
  "L'élégance du cuir, pensée pour la ville et la cérémonie.";
const OLD_SUBTITLE =
  'Fabrication tunisienne, confort et design intemporel — commande sans compte.';

@Injectable()
export class SiteService implements OnModuleInit {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly rows: Repository<SiteSettings>,
  ) {}

  async onModuleInit() {
    const exists = await this.rows.findOne({ where: { id: HOME_ID } });
    if (!exists) {
      await this.rows.save(
        this.rows.create({
          id: HOME_ID,
          heroKicker: 'Collection',
          heroTitle: 'CUIR PREMIUM',
          heroSubtitle: DEFAULT_SUBTITLE,
          coverImages: homepageCovers,
        }),
      );
    } else {
      let dirty = false;
      const covers = Array.isArray(exists.coverImages) ? exists.coverImages : [];
      if (covers.length === 0 || isSeedMedia(covers)) {
        exists.coverImages = homepageCovers;
        dirty = covers.join('|') !== homepageCovers.join('|');
      }
      if (!exists.heroSubtitle || exists.heroSubtitle === OLD_SUBTITLE) {
        exists.heroSubtitle = DEFAULT_SUBTITLE;
        dirty = true;
      }
      if (dirty) await this.rows.save(exists);
    }
  }

  async getHome() {
    const row = await this.ensure();
    return this.toClient(row);
  }

  async updateHome(dto: UpdateSiteDto) {
    const row = await this.ensure();
    if (dto.heroKicker !== undefined) row.heroKicker = dto.heroKicker.trim();
    if (dto.heroTitle !== undefined) row.heroTitle = dto.heroTitle.trim();
    if (dto.heroSubtitle !== undefined) row.heroSubtitle = dto.heroSubtitle.trim();
    if (dto.coverImages !== undefined) {
      row.coverImages = dto.coverImages.map((url) => url.trim()).filter(Boolean).slice(0, 8);
    }
    return this.toClient(await this.rows.save(row));
  }

  private async ensure() {
    const row = await this.rows.findOne({ where: { id: HOME_ID } });
    if (row) return row;
    return this.rows.save(
      this.rows.create({
        id: HOME_ID,
        heroKicker: 'Collection',
        heroTitle: 'CUIR PREMIUM',
        heroSubtitle: DEFAULT_SUBTITLE,
        coverImages: homepageCovers,
      }),
    );
  }

  private toClient(row: SiteSettings) {
    return {
      heroKicker: row.heroKicker || 'Collection',
      heroTitle: row.heroTitle || 'CUIR PREMIUM',
      heroSubtitle: row.heroSubtitle || DEFAULT_SUBTITLE,
      coverImages: Array.isArray(row.coverImages) ? row.coverImages.filter(Boolean) : [],
    };
  }
}
