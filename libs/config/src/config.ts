import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const SharedConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test', 'local')
      .default('development')
      .required(),
    DATABASE_URL: Joi.string().uri().required(),
    RABBITMQ_URL: Joi.string().uri().required(),
    ORDER_QUEUE: Joi.string().required(),
    UPLOADS_DIR: Joi.string().default('uploads'),
    INVOICE_API_URL: Joi.string().uri().required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
});
