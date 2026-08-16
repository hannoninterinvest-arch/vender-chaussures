import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req: { url?: string }, _res: unknown, next: () => void) => {
    const url = req.url ?? '';
    if (url.startsWith('/api/') || url === '/api') {
      next();
      return;
    }
    const path = url.split('?')[0];
    if (
      path === '/health' ||
      path.startsWith('/auth') ||
      path.startsWith('/seller') ||
      path.startsWith('/staff') ||
      path.startsWith('/products') ||
      path.startsWith('/categories') ||
      path.startsWith('/orders') ||
      path.startsWith('/payments') ||
      path.startsWith('/site')
    ) {
      req.url = `/api${url}`;
    }
    next();
  });
  app.setGlobalPrefix('api');
  const origins = (process.env.FRONTEND_URL ?? '*')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const allowAll = origins.includes('*');
  app.enableCors({
    origin: allowAll ? '*' : origins.length === 1 ? origins[0] : origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`API NestJS prête sur le port ${port} (/api)`);
}
bootstrap();
