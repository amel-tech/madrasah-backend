import { ErrorContext } from '../../types';
import { MedarisError } from './medaris.error';

export class ForbiddenError extends MedarisError {
  protected constructor(
    code: string = 'FORBIDDEN',
    message?: string,
    context?: ErrorContext,
  ) {
    super(code, 403, message, context);
  }
}
