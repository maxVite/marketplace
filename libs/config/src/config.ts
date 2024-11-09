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
    RABBITMQ_QUEUE: Joi.string().required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
});
