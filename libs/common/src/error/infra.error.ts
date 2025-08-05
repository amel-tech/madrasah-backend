import { ErrorCode, ErrorContext } from './types';
import { BaseError } from './base.error';

export class InfraError extends BaseError {
  static readonly TYPE = 'INFRA_ERROR';

  private constructor(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ) {
    super(InfraError.TYPE, codeOrErrorCode, context, message);
  }

  static of(
    codeOrErrorCode:ErrorCode,
    context?: ErrorContext,
    message?: string,
  ): InfraError {
    return new InfraError(codeOrErrorCode, context, message);
  }
}