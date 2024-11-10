import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderPayload } from './order.dto';
import { PrismaService } from '@app/prisma';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  sendOrderShippedEvent = async (orderId: string) => {
    this.client.emit<{ orderId: string }>('order_shipped', { orderId });
  };

  create = async (payload: CreateOrderPayload) => {
    const newOrder = await this.prisma.order.create({
      data: payload,
    });

    return newOrder.id;
  };

  getOrderById = async (orderId: string) => {
    return this.prisma.order.findFirstOrThrow({
      where: {
        id: orderId,
      },
    });
  };

  updateStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
      },
    });
    if (status === OrderStatus.SHIPPED) {
      await this.sendOrderShippedEvent(orderId);
    }

    return updatedOrder;
  };

  /**
   * @todo Add pagination, limit
   */
  getAllOrders = async () => {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  };
}
