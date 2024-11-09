import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { SharedConfigModule } from '@app/config';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [SharedConfigModule, PrismaModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
