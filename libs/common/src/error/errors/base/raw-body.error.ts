import { MedarisError } from './medaris.error';

export abstract class RawBodyError<T = unknown> extends MedarisError {
  public readonly body: T;

  protected constructor(code: string, status: number, message: string, body: T) {
    super(code, status, message);
    this.body = body;
  }
}
