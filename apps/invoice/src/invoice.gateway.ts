import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InvoiceService } from './invoice.service';

@Controller()
export class InvoiceGateway {
  constructor(private readonly invoiceService: InvoiceService) {}

  @EventPattern('order_shipped')
  handleOrderShipped(@Payload() data: any) {
    const { orderId, timestamp } = data;
    // this.invoiceService.processInvoice(orderId, timestamp);
    console.log(`Invoice for Order ${orderId} processed at ${timestamp}`);
  }
}
