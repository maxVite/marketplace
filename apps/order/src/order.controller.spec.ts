import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderPayload, UpdateStatusPayload } from './order.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
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

/**
 * @todo use faker
 */
describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn(),
    getAllOrders: jest.fn(),
    getOrderById: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const result = { ...fakeOrderPayload, id: 'order-id' };

      mockOrderService.create.mockResolvedValue(result);

      expect(await controller.create(fakeOrderPayload)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(fakeOrderPayload);
    });

    it('should throw an HttpException on error', async () => {
      const errorMessage = 'Error creating order';
      const error = new HttpException(errorMessage, HttpStatus.BAD_REQUEST);

      mockOrderService.create.mockRejectedValue(error);

      await expect(controller.create(fakeOrderPayload)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(service.create).toHaveBeenCalledWith(fakeOrderPayload);
    });
  });

  describe('allOrders', () => {
    it('should return all orders', async () => {
      const result = [fakeProduct, fakeProduct];

      mockOrderService.getAllOrders.mockResolvedValue(result);

      expect(await controller.allOrders()).toBe(result);
      expect(service.getAllOrders).toHaveBeenCalled();
    });

    it('should throw an HttpException on error', async () => {
      const errorMessage = 'Error listing orders';
      const error = new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      mockOrderService.getAllOrders.mockRejectedValue(error);

      await expect(controller.allOrders()).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect(service.getAllOrders).toHaveBeenCalled();
    });
  });

  describe('getOrder', () => {
    it('should return the order with given id', async () => {
      const orderId = 'order-id';
      const result = {
        ...fakeProduct,
        id: orderId,
      };

      mockOrderService.getOrderById.mockResolvedValue(result);

      expect(await controller.getOrder(orderId)).toBe(result);
      expect(service.getOrderById).toHaveBeenCalledWith(orderId);
    });

    it('should throw an HttpException if order not found', async () => {
      const orderId = 'non-existent-id';
      const errorMessage = `Error retrieving order - ${orderId}`;
      const error = new HttpException(errorMessage, HttpStatus.NOT_FOUND);

      mockOrderService.getOrderById.mockRejectedValue(error);

      await expect(controller.getOrder(orderId)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.NOT_FOUND),
      );
      expect(service.getOrderById).toHaveBeenCalledWith(orderId);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of the order', async () => {
      const orderId = 'order-id';
      const payload: UpdateStatusPayload = { status: OrderStatus.SHIPPED };
      const result = { id: orderId, status: OrderStatus.SHIPPED };

      mockOrderService.updateStatus.mockResolvedValue(result);

      expect(await controller.updateStatus(orderId, payload)).toBe(result);
      expect(service.updateStatus).toHaveBeenCalledWith(
        orderId,
        payload.status,
      );
    });

    it('should throw an HttpException on error', async () => {
      const orderId = 'order-id';
      const payload: UpdateStatusPayload = { status: OrderStatus.SHIPPED };
      const errorMessage = `Error updating status for order - ${orderId}`;
      const error = new HttpException(errorMessage, HttpStatus.BAD_REQUEST);

      mockOrderService.updateStatus.mockRejectedValue(error);

      await expect(controller.updateStatus(orderId, payload)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
      );
      expect(service.updateStatus).toHaveBeenCalledWith(
        orderId,
        payload.status,
      );
    });
  });
});
