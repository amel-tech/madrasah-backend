import { ErrorContext } from '../types';
import { BadRequestError } from './base/bad-request.error';

export class ValidationError extends BadRequestError {
  static readonly code = 'VALIDATION_ERROR';

  constructor(message: string, context?: ErrorContext) {
    super(ValidationError.code, message, context);
  }
}
