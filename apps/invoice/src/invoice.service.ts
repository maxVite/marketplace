import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { access, mkdir, writeFile } from 'node:fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  readonly #logger = new Logger(InvoiceService.name);

  readonly #UPLOADS_DIR = this.config.get<string>('UPLOADS_DIR');
  readonly #API_URL = this.config.get<string>('INVOICE_API_URL');

  /**
   * @todo Switch to GridFS implementation, local storage used to simplify upload
   */
  uploadInvoice = async (orderId: string, file: Express.Multer.File) => {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (file.mimetype !== 'application/pdf')
      throw new BadRequestException('Only PDF files are allowed');

    const uploadsDir = path.join(process.cwd(), 'uploads');

    try {
      await access(uploadsDir);
    } catch (err) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const fileName = `${randomUUID()}-${file.originalname}`;
    const filePath = path.join(this.#UPLOADS_DIR || 'uploads', fileName);

    await writeFile(filePath, file.buffer);

    const invoice = await this.prisma.invoice.create({
      data: {
        orderId,
        uploadedAt: new Date(),
        pdfUrl: `${this.#API_URL}/uploads/${fileName}`,
      },
    });

    return invoice;
  };

  async sendInvoice(invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId },
    });

    if (!invoice)
      throw new NotFoundException('Invoice not found for this order');

    if (!invoice.sentAt) {
      const updatedInvoice = await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { sentAt: new Date() },
      });
      this.#logger.log(
        `Invoice sent out for order: ${updatedInvoice.orderId}, invoice: ${updatedInvoice.id}`,
      );

      return updatedInvoice;
    }

    return invoice;
  }

  /**
   * @todo Add pagination, limit
   */
  getAllInvoices = async () =>
    this.prisma.invoice.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
    });

  getInvoiceById = (id: string) =>
    this.prisma.invoice.findFirst({ where: { id } });

  findInvoiceByOrderId = async (orderId: string) =>
    this.prisma.invoice.findFirst({ where: { orderId } });

  /**
   * @todo notify seller by mail or other way
   */
  notifySellerMissingInvoice = async (orderId: string) => {
    this.#logger.log(
      `Notifying seller about missing invoice for order ID: ${orderId}`,
    );
  };

  processInvoice = async (orderId: string) => {
    const invoice = await this.findInvoiceByOrderId(orderId);

    if (invoice) {
      await this.sendInvoice(invoice.id);
    } else {
      this.#logger.warn(`Missing invoice for Order ID: ${orderId}`);
      await this.notifySellerMissingInvoice(orderId);
    }
  };
}
