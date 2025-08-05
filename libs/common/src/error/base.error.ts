import { ErrorCode, ErrorContext } from './types';

export abstract class BaseError extends Error {
  public readonly type: string;
  public readonly code: string;
  public readonly context?: ErrorContext;
  protected _status: number;

  protected constructor(
    type: string,
    errorCode: ErrorCode,
    context?: ErrorContext,
    message?: string,
  ) {
    super(message || errorCode.code);
    this.type = type;
    this.code = errorCode.code;
    this._status = errorCode.status;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  get status(): number {
    return this._status;
  }

  withStatus(status: number): this {
    this._status = status;
    return this;
  }
}