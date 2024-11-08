import { NestFactory } from '@nestjs/core';
import { InvoiceModule } from './invoice.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(InvoiceModule);
  const logger = new Logger('bootstrap');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://root:example@localhost:5672'],
      queue: 'order_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  logger.log('Invoice Service microservice connected to RabbitMQ');
}
bootstrap();
