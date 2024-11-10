import { PrismaService } from '@app/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { access, mkdir, writeFile } from 'fs/promises';

jest.mock('fs/promises');

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrisma = {
    order: { findUnique: jest.fn() },
    invoice: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'UPLOADS_DIR':
          return 'uploads';
        case 'INVOICE_API_URL':
          return 'http://localhost:3001';
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uploadInvoice, should upload an invoice', async () => {
    const orderId = 'order-id';
    const file = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from(''),
    };

    mockPrisma.order.findUnique.mockResolvedValue({ id: orderId });
    mockPrisma.invoice.create.mockResolvedValue({ id: 'invoice-id' });

    (access as jest.Mock).mockResolvedValue(undefined);
    (mkdir as jest.Mock).mockResolvedValue(undefined);
    (writeFile as jest.Mock).mockResolvedValue(undefined);

    const result = await service.uploadInvoice(
      orderId,
      file as Express.Multer.File,
    );

    expect(result).toEqual({ id: 'invoice-id' });
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: orderId },
    });
    expect(prisma.invoice.create).toHaveBeenCalled();
  });

  it('uploadInvoice, should throw NotFoundException if order not found during upload', async () => {
    const orderId = 'non-existent';
    const file = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from(''),
    };

    mockPrisma.order.findUnique.mockResolvedValue(null);

    await expect(
      service.uploadInvoice(orderId, file as Express.Multer.File),
    ).rejects.toThrow(NotFoundException);
  });

  it('sendInvoice, should send an invoice', async () => {
    const invoiceId = 'invoice-id';
    const invoice = { id: invoiceId, orderId: 'order-id', sentAt: null };

    mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
    mockPrisma.invoice.update.mockResolvedValue({
      ...invoice,
      sentAt: new Date(),
    });

    const result = await service.sendInvoice(invoiceId);
    expect(result.sentAt).toBeInstanceOf(Date);
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: invoiceId },
      data: { sentAt: expect.any(Date) },
    });
  });

  it('processInvoice, should send invoice if it exists for the given orderId', async () => {
    const orderId = 'order-1';
    const invoiceId = 'invoice-1';

    jest
      .spyOn(service, 'findInvoiceByOrderId')
      .mockResolvedValue({
        id: invoiceId,
        orderId,
        uploadedAt: new Date(),
        sentAt: null,
        pdfUrl: 'https://fake.url',
      });
    const sendInvoiceSpy = jest.spyOn(service, 'sendInvoice');

    await service.processInvoice(orderId);

    expect(service.findInvoiceByOrderId).toHaveBeenCalledWith(orderId);
    expect(sendInvoiceSpy).toHaveBeenCalledWith(invoiceId);
  });

  it('processInvoice, should notify seller if invoice is missing', async () => {
    const orderId = 'order-1';

    jest.spyOn(service, 'findInvoiceByOrderId').mockResolvedValue(null);
    const notifySellerSpy = jest.spyOn(service, 'notifySellerMissingInvoice');

    await service.processInvoice(orderId);

    expect(service.findInvoiceByOrderId).toHaveBeenCalledWith(orderId);
    expect(notifySellerSpy).toHaveBeenCalledWith(orderId);
  });
});
