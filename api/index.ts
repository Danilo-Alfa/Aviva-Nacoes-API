import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';

const server = express();

let appPromise: Promise<void> | null = null;
let swaggerDocument: object | null = null;

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

  swaggerDocument = SwaggerModule.createDocument(app, config);

  // Endpoint para o JSON do Swagger
  expressInstance.get('/api/docs/swagger.json', (_req, res) => {
    res.json(swaggerDocument);
  });

  // Endpoint para o Swagger UI com CDN
  expressInstance.get('/api/docs', (_req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aviva Nações API - Documentação</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/docs/swagger.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout'
      });
    };
  </script>
</body>
</html>
    `);
  });

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
