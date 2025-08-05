import { LoggerService } from '@nestjs/common';
import { LoggerConfig } from './logger.interface';
import { PinoLogger } from './pino.logger';
import { WinstonLogger } from './winston.logger';

export enum LoggerType {
  PINO = 'pino',
  WINSTON = 'winston',
}

export class LoggerFactory {
  static create(type?: LoggerType, config?: LoggerConfig): LoggerService {
    const loggerType = type || (process.env.LOGGER_TYPE as LoggerType) || LoggerType.PINO;
    switch (loggerType) {
      case LoggerType.PINO:
        return new PinoLogger(config);
      case LoggerType.WINSTON:
        return new WinstonLogger(config);
      default:
        throw new Error(`Unsupported logger type: ${type}`);
    }
  }
}
