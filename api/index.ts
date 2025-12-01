import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (app) {
    return app;
  }

  app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Swagger (Documentação)
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Aviva Nações API')
      .setDescription(
        'API Backend para o sistema Aviva Nações - Live, Chat e Automações',
      )
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
      .addApiKey(
        { type: 'apiKey', name: 'x-admin-password', in: 'header' },
        'admin-password',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.init();
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
}
