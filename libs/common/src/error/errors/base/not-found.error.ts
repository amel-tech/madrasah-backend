import { ErrorContext } from '../../types';
import { MedarisError } from './medaris.error';

export class NotFoundError extends MedarisError {
  protected constructor(
    code: string = 'NOT_FOUND',
    message?: string,
    context?: ErrorContext,
  ) {
    super(code, 404, message, context);
  }
}
