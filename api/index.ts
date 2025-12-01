import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';

const server = express();

let appPromise: Promise<void> | null = null;

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger (Documentação)
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
    .addTag('live', 'Endpoints para gerenciamento da transmissão ao vivo')
    .addTag('chat', 'Endpoints para chat da live')
    .addTag('viewers', 'Endpoints para gerenciamento de viewers')
    .addTag('automation', 'Endpoints para automações externas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
};

const bootstrap = () => {
  if (!appPromise) {
    appPromise = createNestServer(server);
  }
  return appPromise;
};

export default async (req: Request, res: Response) => {
  await bootstrap();
  server(req, res);
};
