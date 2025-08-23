import {
  PipeTransform,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from "@nestjs/common";
import { ValidationError as MedarisValidationError } from "../error";

export class MedarisValidationPipe extends ValidationPipe implements PipeTransform<any, any> {
  constructor(opts: ValidationPipeOptions = {}) {
    const defaultOptions: ValidationPipeOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((e) => ({
          property: e.property,
          value: e.value,
          constraints: e.constraints,
        }));
        
        const propertyNames = errors.map(e => e.property).join(', ');
        const errorMessage = `Validation error for properties: ${propertyNames}`;
        
        throw new MedarisValidationError(errorMessage, {
          errors: validationErrors,
        });
      },
    };

    super({
      ...defaultOptions,
      ...opts,
    });
  }
}
