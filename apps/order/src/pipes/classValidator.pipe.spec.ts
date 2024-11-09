import { ArgumentMetadata } from '@nestjs/common';
import { ClassValidatorPipe } from './classValidator.pipe';

describe('ClassValidatorPipe', () => {
  let pipe: ClassValidatorPipe;

  beforeEach(() => {
    pipe = new ClassValidatorPipe();
  });

  describe('transform', () => {
    it('should return the value if metatype is a built-in type', async () => {
      const value = 'test';
      const metadata: ArgumentMetadata = {
        type: 'query',
        metatype: String,
      };

      const result = await pipe.transform(value, metadata);
      expect(result).toEqual(value);
    });

    it('should transform and validate the value if metatype is a custom class', async () => {
      class TestDto {
        value: string;
      }

      const value = { value: 'test' };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const result = await pipe.transform(value, metadata);
      expect(result).toEqual(value);
    });
  });

  describe('toValidate', () => {
    it('should return true if metatype is not a built-in type', () => {
      class TestDto {}

      const result = pipe.toValidate(TestDto);
      expect(result).toBe(true);
    });

    it('should return false if metatype is a built-in type', () => {
      expect(pipe.toValidate(String)).toBe(false);
      expect(pipe.toValidate(Boolean)).toBe(false);
      expect(pipe.toValidate(Number)).toBe(false);
      expect(pipe.toValidate(Array)).toBe(false);
      expect(pipe.toValidate(Object)).toBe(false);
    });
  });
});
