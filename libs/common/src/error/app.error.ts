import { ErrorCode, ErrorContext } from './types';
import { BaseError } from './base.error';

export class AppError extends BaseError {
  static readonly TYPE = 'APP_ERROR';

  private constructor(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ) {
    super(AppError.TYPE, codeOrErrorCode, context, message);
  }

  static of(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ): AppError {
    return new AppError(codeOrErrorCode, context, message);
  }
}