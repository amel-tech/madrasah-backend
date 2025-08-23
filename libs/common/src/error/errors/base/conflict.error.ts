import { ErrorContext } from '../../types';
import { MedarisError } from './medaris.error';

export class ConflictError extends MedarisError {
  protected constructor(
    code: string = 'CONFLICT',
    message?: string,
    context?: ErrorContext,
  ) {
    super(code, 409, message, context);
  }
}
