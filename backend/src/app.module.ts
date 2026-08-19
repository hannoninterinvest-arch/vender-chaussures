import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { SellerModule } from './seller/seller.module';
import { PaymentsModule } from './payments/payments.module';
import { SiteModule } from './site/site.module';
import { WholesaleModule } from './wholesale/wholesale.module';

/** Neon ajoute parfois channel_binding=require, que node-pg refuse. */
function postgresUrl(raw: string) {
  try {
    const parsed = new URL(raw);
    parsed.searchParams.delete('channel_binding');
    return parsed.toString();
  } catch {
    return raw.replace(/([?&])channel_binding=[^&]*&?/g, '$1').replace(/[?&]$/, '');
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: postgresUrl(config.getOrThrow<string>('DATABASE_URL')),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    AuthModule,
    ProductsModule,
    OrdersModule,
    SellerModule,
    PaymentsModule,
    SiteModule,
    WholesaleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
