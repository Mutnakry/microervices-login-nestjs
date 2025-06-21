import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ Express type

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // ✅ Typed for Express
  const configService = app.get(ConfigService);

  // ✅ Enable trust proxy (so req.ip is accurate behind proxies)
  app.set('trust proxy', true);

  // 🌐 Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Microservice API')
    .setDescription('API documentation for NestJS microservices')
    .setVersion('1.0')
    // .addTag('tenants')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/duco', app, document);

  // 🛡️ Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  // 🔓 Enable CORS
  app.enableCors({
    origin: '*', // 🔐 Change to your frontend origin in production
    credentials: true,
  });

  // 🔌 TCP Microservice Configuration
  const tcpHost = configService.get<string>('tcp.host') ?? '127.0.0.1';
  const tcpPort = configService.get<number>('tcp.port') ?? 8877;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: tcpHost,
      port: tcpPort,
    },
  });

  // 🚀 Start all connected microservices
  await app.startAllMicroservices();

  // 🌍 Start HTTP Server
  const httpPort =
    parseInt(process.env.PORT || '', 10) ||
    configService.get<number>('httpPort') ||
    3000;

  await app.listen(httpPort);

  console.log(`🚀 HTTP server running at http://localhost:${httpPort}`);
  console.log(`📘 Swagger available at http://localhost:${httpPort}/api/duco`);
}

bootstrap();
