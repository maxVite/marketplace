import { NestFactory } from '@nestjs/core';
import { InvoiceModule } from './invoice.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(InvoiceModule);
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService);

  const uploadsDir = join(
    process.cwd(),
    configService.get<string>('UPLOADS_DIR') || 'uploads',
  );
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  const RABBITMQ_URL = configService.getOrThrow('RABBITMQ_URL');
  const ORDER_QUEUE = configService.getOrThrow('ORDER_QUEUE');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: ORDER_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  logger.log('Invoice microservice connected to RabbitMQ');
}
bootstrap();
