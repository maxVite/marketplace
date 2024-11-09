import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { ClassValidatorPipe } from './pipes';

async function bootstrap() {
  const app = await NestFactory.create(OrderModule);

  app.useGlobalPipes(new ClassValidatorPipe());

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
