import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ClassValidatorPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const constraintErrors = errors.map((err) => err?.constraints);
      throw new BadRequestException(
        `Validation failed: ${JSON.stringify(constraintErrors)}`,
      );
    }
    return value;
  }

  public toValidate<T>(metatype: Type<T>): boolean {
    const types: Array<new () => unknown> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }
}
