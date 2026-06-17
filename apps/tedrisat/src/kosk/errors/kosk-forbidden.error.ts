import { ErrorContext, ForbiddenError } from '@madrasah/common';

export class KoskForbiddenError extends ForbiddenError {
  static readonly code = 'KOSK_FORBIDDEN';

  constructor(
    message = 'You are not the owner of this köşk',
    context?: ErrorContext,
  ) {
    super(KoskForbiddenError.code, message, context);
  }
}
