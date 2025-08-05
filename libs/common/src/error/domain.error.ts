import { ErrorCode, ErrorContext } from './types';
import { BaseError } from './base.error';

export class DomainError extends BaseError {
  static readonly TYPE = 'DOMAIN_ERROR';

  private constructor(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ) {
    super(DomainError.TYPE, codeOrErrorCode, context, message);
  }

  static of(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ): DomainError {
    return new DomainError(codeOrErrorCode, context, message);
  }
}