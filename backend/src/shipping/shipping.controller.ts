import { Controller, Get, Logger, Query, Req } from '@nestjs/common';
import { FxService } from './fx.service';
import { GeoService } from './geo.service';
import { quoteShipping } from './shipping';

@Controller()
export class ShippingController {
  private readonly log = new Logger(ShippingController.name);

  constructor(
    private readonly geo: GeoService,
    private readonly fx: FxService,
  ) {}

  @Get('geo')
  async geoCountry(@Req() req: { ip?: string; headers: Record<string, unknown> }) {
    const ip = this.geo.clientIp(req);
    return this.geo.detectCountry(ip);
  }

  @Get('fx')
  fxRates() {
    return this.fx.getRates();
  }

  @Get('shipping/quote')
  quote(@Query('country') country = 'TN', @Query('weight') weight = '0') {
    const quote = quoteShipping(country, Number(weight));
    if (!quote.knownCountry) {
      this.log.warn(
        `Pays non listé « ${quote.country} » → DHL (reste du monde)`,
      );
    }
    return quote;
  }
}
