import { NestFactory } from '@nestjs/core';
import { InvoiceModule } from './invoice.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(InvoiceModule);
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService);

  const RABBITMQ_URL = configService.getOrThrow('RABBITMQ_URL');
  const RABBITMQ_QUEUE = configService.getOrThrow('RABBITMQ_QUEUE');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: RABBITMQ_QUEUE,
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
