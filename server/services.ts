import { RateLimits } from "./security/rate-limit";
import { OrderAccessService } from "./orders/order-access.service";
import { CommerceStore } from "./commerce-store";
import { CountryRatesService } from "./shipping/country-rates.service";
import "reflect-metadata";
import type { DataSource } from "typeorm";
import { database } from "./database";
import { ConfigService } from "./config";
import { User } from "./auth/user.entity";
import { AuthService } from "./auth/auth.service";
import { Product } from "./products/product.entity";
import { Category } from "./products/category.entity";
import { ProductsService } from "./products/products.service";
import { Order } from "./orders/order.entity";
import { OrderItem } from "./orders/order-item.entity";
import { OrdersService } from "./orders/orders.service";
import { ShippingRate } from "./shipping/shipping-rate.entity";
import { ShippingService } from "./shipping/shipping.service";
import { SiteSettings } from "./site/site-settings.entity";
import { SiteService } from "./site/site.service";
import { WholesaleRequest } from "./wholesale/wholesale-request.entity";
import { WholesaleService } from "./wholesale/wholesale.service";
import { KonnectService } from "./payments/konnect.service";
import { FlouciService } from "./payments/flouci.service";
import { CloudinaryService } from "./seller/cloudinary.service";
import { CurrencyService } from "./currency/currency.service";

export function createServices(db: DataSource) {
  const config = new ConfigService();
  const store = new CommerceStore(db);
  const countryRates = new CountryRatesService(store);
  const products = new ProductsService(
    db.getRepository(Product),
    db.getRepository(Category),
  );
  const shipping = new ShippingService(
    db.getRepository(ShippingRate),
    countryRates,
  );
  const konnect = new KonnectService(config);
  const flouci = new FlouciService(config, konnect);
  return {
    rateLimits: new RateLimits(db),
    orderAccess: new OrderAccessService(config),
    auth: new AuthService(db.getRepository(User), config),
    products,
    shipping,
    countryRates,
    konnect,
    flouci,
    orders: new OrdersService(
      db.getRepository(Order),
      db.getRepository(OrderItem),
      products,
      konnect,
      shipping,
      flouci,
      store,
      new OrderAccessService(config),
    ),
    site: new SiteService(db.getRepository(SiteSettings)),
    wholesale: new WholesaleService(
      db.getRepository(WholesaleRequest),
      products,
    ),
    uploads: new CloudinaryService(config),
    currency: new CurrencyService(config),
  };
}
let ready: Promise<ReturnType<typeof createServices>> | undefined;
export function services() {
  if (!ready)
    ready = database()
      .then(createServices)
      .catch((error) => {
        ready = undefined;
        throw error;
      });
  return ready;
}
