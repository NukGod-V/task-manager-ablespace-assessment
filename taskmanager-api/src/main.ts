import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Reads from env now instead of hardcoded `origin: true` — supports a
  // comma-separated list so both your production domain and localhost
  // (for continued local testing) work simultaneously.
  const allowedOrigins = (config.get<string>('CORS_ORIGIN') ?? config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim());
  app.enableCors({ origin: allowedOrigins, credentials: true });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();