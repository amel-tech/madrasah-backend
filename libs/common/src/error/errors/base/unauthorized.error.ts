import { ErrorContext } from '../../types';
import { MedarisError } from './medaris.error';

export class UnauthorizedError extends MedarisError {
  protected constructor(
    code: string = 'UNAUTHORIZED',
    message?: string,
    context?: ErrorContext,
  ) {
    super(code, 401, message, context);
  }
}
