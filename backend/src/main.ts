import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe API global
  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('DJASSA API')
    .setDescription('API REST multi-vendeurs — marketplace avec gestion de stock')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀  API DJASSA démarrée sur http://localhost:${port}/api/v1`);
  console.log(`📖  Documentation : http://localhost:${port}/api/docs`);
}

bootstrap();
