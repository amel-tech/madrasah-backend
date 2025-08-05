import { ErrorCode, ErrorContext } from './types';
import { BaseError } from './base.error';

export class ServiceError extends BaseError {
  static readonly TYPE = 'SERVICE_ERROR';

  private constructor(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ) {
    super(ServiceError.TYPE, codeOrErrorCode, context, message);
  }

  static of(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ): ServiceError {
    return new ServiceError(codeOrErrorCode, context, message);
  }
}