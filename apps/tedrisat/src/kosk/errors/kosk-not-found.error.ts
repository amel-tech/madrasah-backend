import { ErrorContext, NotFoundError } from '@madrasah/common';

export class KoskNotFoundError extends NotFoundError {
  static readonly code = 'KOSK_NOT_FOUND';

  constructor(koskId: string, context?: ErrorContext) {
    super(KoskNotFoundError.code, `Köşk with id ${koskId} not found`, context);
  }
}
