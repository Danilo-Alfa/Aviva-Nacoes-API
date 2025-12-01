import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
      .addTag('live', 'Endpoints para gerenciamento da transmissão ao vivo')
      .addTag('chat', 'Endpoints para chat da live')
      .addTag('viewers', 'Endpoints para gerenciamento de viewers')
      .addTag('automation', 'Endpoints para automações externas')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentacao: http://localhost:${port}/docs`);
}

bootstrap();
