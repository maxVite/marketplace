import { Injectable } from '@nestjs/common';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://root:example@localhost:5672'],
      queue: 'order_queue',
      queueOptions: {
        durable: false,
      },
    },
  })
  client: ClientProxy;
}
