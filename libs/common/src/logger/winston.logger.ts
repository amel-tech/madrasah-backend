import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { ILogger, LoggerConfig, LogLevel } from './logger.interface';

@Injectable()
export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;
  private context?: string;

  constructor(config?: LoggerConfig) {
    const transports: winston.transport[] = [];

    // Console transport
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.colorize({ all: true }),
          winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
            let log = `${timestamp} [${level}]`;
            if (context) log += ` [${context}]`;
            log += ` ${message}`;
            if (trace) log += `\n${trace}`;
            if (Object.keys(meta).length > 0) {
              log += `\n${JSON.stringify(meta, null, 2)}`;
            }
            return log;
          })
        ),
      })
    );

    // File transports for production or when explicitly enabled
    if (config?.enableFileLogging || process.env.NODE_ENV === 'production') {
      const logDir = config?.logDirectory || './logs';
      
      transports.push(
        new winston.transports.File({
          filename: `${logDir}/error.log`,
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: `${logDir}/combined.log`,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        })
      );
    }

    const winstonConfig: winston.LoggerOptions = {
      level: this.mapLogLevel(config?.level || LogLevel.INFO),
      transports,
    };

    this.logger = winston.createLogger(winstonConfig);
    this.context = config?.context;
  }

  private mapLogLevel(level: LogLevel): string {
    const levelMap: Record<LogLevel, string> = {
      [LogLevel.ERROR]: 'error',
      [LogLevel.WARN]: 'warn',
      [LogLevel.INFO]: 'info',
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.VERBOSE]: 'verbose',
    };
    return levelMap[level] || 'info';
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.info(message, logData);
  }

  error(message: string, error?: Error | any, trace?: string) {
    const logData = { context: this.context, ...(error && { error }), ...(trace && { trace }) };
    this.logger.error(message, logData);
  }

  warn(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.warn(message, logData);
  }

  debug(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.debug(message, logData);
  }

  verbose(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.verbose(message, logData);
  }
}
