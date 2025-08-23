import { ErrorContext, NotFoundError } from '@madrasah/common';

export class ExampleNotFoundError extends NotFoundError {
  static readonly code = 'EXAMPLE_NOT_FOUND';

  constructor(message: string, context?: ErrorContext) {
    super(ExampleNotFoundError.code, message, context);
  }
}
