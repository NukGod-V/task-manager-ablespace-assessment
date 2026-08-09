import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Strips unknown properties and auto-validates every incoming DTO
  // against its class-validator decorators — this is what makes
  // "strict validation" actually enforced at the framework level.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Next.js frontend will run on a different origin (localhost:3000 / vercel.app)
  app.enableCors({
    origin: true, // tighten to your actual frontend domain before submission
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();