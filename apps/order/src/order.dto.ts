import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateOrderPayload {
  @IsNumber()
  price: number;
  @IsNumber()
  quantity: number;
  @IsString()
  productId: string;
  @IsString()
  customerId: string;
  @IsString()
  sellerId: string;
}

export class UpdateStatusPayload {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
