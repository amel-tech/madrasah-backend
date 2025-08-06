import { ErrorCode, ErrorContext } from './types';

export class MedarisError extends Error {
  public readonly code: string;
  public readonly context?: ErrorContext;
  protected _status: number;

  protected constructor(
    errorCode: ErrorCode,
    message?: string,
    context?: ErrorContext,
  ) {
    super(message || errorCode.code);
    this.code = errorCode.code;
    this._status = errorCode.status;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static of(
    errorCode: ErrorCode,
    message?: string,
    context?: ErrorContext,
  ): MedarisError {
    return new MedarisError(errorCode, message, context);
  }

  get status(): number {
    return this._status;
  }

  withStatus(status: number): this {
    this._status = status;
    return this;
  }
}
