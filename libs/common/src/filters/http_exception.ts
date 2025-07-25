import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import SupportedLanguages from 'constants/supported_languages';
import { Request, Response } from 'express';

export type HttpExceptionFilterDictionary = { [K in SupportedLanguages]: { businessExceptions: { [key: string]: string }, notFoundExceptions: { [key: string]: string }, } }

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  dictionary: HttpExceptionFilterDictionary;
  constructor(args: { dictionary: HttpExceptionFilterDictionary }) { this.dictionary = args.dictionary }
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionBody: any = exception.getResponse();
    let dict = this.dictionary.en;
    if (typeof request.headers['x-language'] === "string") dict = this.dictionary[request.headers['x-language'] as SupportedLanguages] ?? this.dictionary.en;
    if (exception.name === 'BusinessException') {
      return response.status(status).json({
        ...exceptionBody,
        message: dict.businessExceptions?.[exceptionBody.errorCode] ?? exceptionBody.errorCode,
      });
    }
    if (exception.name === 'NotFoundException') {
      return response.status(status).json({
        ...exceptionBody,
        message: dict.notFoundExceptions?.[exceptionBody.errorCode] ?? exceptionBody.errorCode,
      });
    }
    response.status(status).json(exceptionBody);
  }
}
