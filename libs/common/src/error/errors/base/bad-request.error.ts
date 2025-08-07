import { ErrorContext } from '../../types';
import { MedarisError } from './medaris.error';

export class BadRequestError extends MedarisError {
  protected constructor(
    code: string = 'BAD_REQUEST',
    message?: string,
    context?: ErrorContext,
  ) {
    super(code, 400, message, context);
  }
}
