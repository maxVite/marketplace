import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

describe('InvoiceController', () => {
  let invoiceController: InvoiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [InvoiceService],
    }).compile();

    invoiceController = app.get<InvoiceController>(InvoiceController);
  });

  describe('root', () => {
    it.skip('should return "Hello World!"', () => {});
  });
});
