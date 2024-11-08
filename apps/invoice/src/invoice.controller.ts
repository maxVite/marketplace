import { Controller, Get } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Controller()
export class InvoiceController {
  constructor(private readonly _invoiceService: InvoiceService) {}
}
