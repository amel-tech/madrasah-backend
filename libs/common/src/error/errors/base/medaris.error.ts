import { ErrorContext } from '../../types';

export abstract class MedarisError extends Error {
  public readonly code: string;
  public readonly context?: ErrorContext;
  protected _status: number;

  protected constructor(
    code: string,
    status: number,
    message?: string,
    context?: ErrorContext,
  ) {
    super(message || code);
    this.code = code;
    this._status = status;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  get status(): number {
    return this._status;
  }
}
