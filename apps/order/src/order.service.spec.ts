import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '@app/prisma';
import { ClientProxy } from '@nestjs/microservices';
import { OrderStatus } from '@prisma/client';

/**
 * @todo move this to a common folder
 */
const fakeOrderPayload = {
  productId: 'fakeProductId',
  sellerId: 'fakeSellerId',
  customerId: 'fakeCustomerId',
  quantity: 2,
  price: 1500,
};

const fakeProduct = {
  id: 'order1',
  productId: 'fakeProductId',
  quantity: 2,
  price: 1500,
  status: 'CREATED',
  createdAt: new Date(),
  customerId: 'fakeCustomerId',
  sellerId: 'fakeSellerId',
};

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;
  let client: ClientProxy;

  const mockPrisma = {
    order: {
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'RABBITMQ_CLIENT', useValue: mockClient },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
    client = module.get<ClientProxy>('RABBITMQ_CLIENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create, should create an order', async () => {
    const createdOrder = { ...fakeOrderPayload, id: 'order-id' };

    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const result = await service.create(fakeOrderPayload);
    expect(result).toBe(createdOrder.id);
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: fakeOrderPayload,
    });
  });

  it('getOrderById, should return an order by ID', async () => {
    const orderId = 'order-id';
    const order = { id: orderId, ...fakeOrderPayload };

    mockPrisma.order.findFirstOrThrow.mockResolvedValue(order);

    const result = await service.getOrderById(orderId);
    expect(result).toBe(order);
    expect(prisma.order.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: orderId },
    });
  });

  it('updateStatus, should update the order status and emit event if status is SHIPPED', async () => {
    const orderId = 'order-id';
    const status = OrderStatus.SHIPPED;
    const updatedOrder = { id: orderId, status };
    mockPrisma.order.update.mockResolvedValue(updatedOrder);

    const result = await service.updateStatus(orderId, status);

    expect(result).toBe(updatedOrder);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: { status },
    });
    expect(client.emit).toHaveBeenCalledWith('order_shipped', { orderId });
  });

  it('getAllOrders, should get all orders', async () => {
    const orders = [fakeProduct, fakeProduct];

    mockPrisma.order.findMany.mockResolvedValue(orders);

    const result = await service.getAllOrders();
    expect(result).toBe(orders);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });
});
