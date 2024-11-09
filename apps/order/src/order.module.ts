import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { SharedConfigModule } from '@app/config';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Module({
  imports: [SharedConfigModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: 'RABBITMQ_CLIENT',
      useFactory: (configService: ConfigService): ClientProxy => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL')],
            queue: configService.get('RABBITMQ_QUEUE'),
            queueOptions: {
              durable: false,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [OrderService, 'RABBITMQ_CLIENT'],
})
export class OrderModule {}
