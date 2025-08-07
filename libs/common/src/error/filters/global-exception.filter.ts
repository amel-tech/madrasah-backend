import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { MedarisError } from '../errors/base/medaris.error';
import { ErrorResponse } from '../types/error-response.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let errorResponse: ErrorResponse;

    if (exception instanceof MedarisError) {
      errorResponse = {
        type: 'APP_ERROR',
        code: exception.code,
        status: exception.status,
        message: exception.message,
        context: exception.context,
        timestamp: new Date().toISOString(),
      };
      this.logger.error(`${exception.code}: ${exception.message}`, exception.context);
    } else if (exception instanceof HttpException) {
      const httpResponse = exception.getResponse();
      const message = typeof httpResponse === 'string' ? httpResponse : (httpResponse as Record<string, unknown>).message as string;
      errorResponse = {
        type: 'HTTP_ERROR',
        status: exception.getStatus(),
        message,
        timestamp: new Date().toISOString(),
      };
      this.logger.error(`HTTP_ERROR-${exception.getStatus()}: ${message}`);
    } else {
      errorResponse = {
        type: 'UNKNOWN_ERROR',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception instanceof Error ? exception.message : `Internal server error: ${String(exception)}`,
        timestamp: new Date().toISOString(),
      };
      this.logger.error('UNEXPECTED_ERROR', exception);
    }

    response.status(errorResponse.status).json(errorResponse);
  }
}