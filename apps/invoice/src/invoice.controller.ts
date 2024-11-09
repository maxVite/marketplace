import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join, basename } from 'path';
import { InvoiceService } from './invoice.service';
import { access } from 'node:fs/promises';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly config: ConfigService,
    private readonly invoiceService: InvoiceService,
  ) {}

  readonly #logger = new Logger(InvoiceController.name);

  @Post(':orderId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @Param('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.invoiceService.uploadInvoice(orderId, file);
  }

  @Get()
  async allInvoices() {
    return this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  async getInvoice(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(id);
  }

  /**
   * @todo use env variables for uploads dir
   */
  @Get('pdf/:id')
  async viewPdf(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoiceService.getInvoiceById(id);

    if (!invoice)
      throw new NotFoundException(`Invoice with ID ${id} not found`);

    const url = invoice.pdfUrl;
    const fileName = basename(url);

    const uploadsDir = join(
      process.cwd(),
      this.config.get<string>('UPLOADS_DIR') || 'uploads',
    );
    const filePath = join(uploadsDir, fileName);

    try {
      await access(filePath);
    } catch (err) {
      throw new NotFoundException(`File not found at path ${filePath}`);
    }

    return res.sendFile(filePath);
  }

  @EventPattern('order_shipped')
  async handleOrderShipped(@Payload() data: { orderId: string }) {
    const { orderId } = data;
    try {
      this.#logger.debug(
        `Received 'order_shipped' event for Order ID: ${orderId} at ${new Date()}`,
      );

      await this.invoiceService.processInvoice(orderId);
      this.#logger.debug(
        `Invoice for Order ID: ${orderId} processed successfully.`,
      );
    } catch (error) {
      this.#logger.error(
        `Failed to process invoice for Order ID: ${orderId}. Error: ${error.message}`,
      );
    }
  }
}
