import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderModule } from './order.module';
import { Logger } from '@nestjs/common';
import { ClassValidatorPipe } from './pipes';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(OrderModule);
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

  app.useGlobalPipes(new ClassValidatorPipe());

  await app.startAllMicroservices();
  await app.listen(3000);
  logger.log('Order microservice connected to RabbitMQ');
}
bootstrap();
