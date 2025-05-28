

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Microservice API')
    .setDescription('API documentation for NestJS microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/duco', app, document); // Swagger available at http://localhost:3000/api

  // Enable validation for DTOs
  app.useGlobalPipes(new ValidationPipe());

  // TCP microservice config
  const tcpHost = configService.get<string>('tcp.host') ?? '127.0.0.1';
  const tcpPort = configService.get<number>('tcp.port') ?? 8877;
  const httpPort = configService.get<number>('httpPort') ?? 3000;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: tcpHost,
      port: tcpPort,
    },
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);

  console.log(`🚀 HTTP server running at http://localhost:${httpPort}`);
  console.log(`📘 Swagger available at http://localhost:${httpPort}/api`);
}
bootstrap();
