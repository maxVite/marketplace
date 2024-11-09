import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderPayload, UpdateStatusPayload } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  readonly #logger = new Logger(OrderController.name);

  @Post()
  async create(@Body() payload: CreateOrderPayload) {
    try {
      return await this.service.create(payload);
    } catch (error) {
      this.#logger.error(`Error creating new order ${error.message}`);
      throw new HttpException(
        error?.message ?? 'Error creating new order',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async listOrders() {
    try {
      return await this.service.getAllOrders();
    } catch (error) {
      this.#logger.error(`Error listing orders ${error.message}`);
      throw new HttpException(
        error?.message ?? 'Error listing orders',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    try {
      return await this.service.getOrderById(id);
    } catch (error) {
      this.#logger.error(`Error retrieving order - ${id}:  ${error.message}`);
      throw new HttpException(
        error?.message ?? `Error retrieving order - ${id}`,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateStatusPayload,
  ) {
    try {
      return await this.service.updateStatus(id, payload.status);
    } catch (error) {
      this.#logger.error(
        `Error updating status for order - ${id}:  ${error.message}`,
      );
      throw new HttpException(
        error?.message ?? `Error updating status for order - ${id}`,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
