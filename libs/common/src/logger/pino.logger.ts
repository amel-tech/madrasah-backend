import { Injectable} from '@nestjs/common';
import pino from 'pino';
import { ILogger, LoggerConfig, LogLevel } from './logger.interface';

@Injectable()
export class PinoLogger implements ILogger {
  private readonly logger: pino.Logger;
  private context?: string;

  constructor(config?: LoggerConfig) {
    const pinoConfig: pino.LoggerOptions = {
      level: config?.level || process.env.LOG_LEVEL || LogLevel.INFO,
      name: config?.name || process.env.SERVICE_NAME,
      timestamp: config?.timestamp !== false,
    };

    // Enable pretty printing in development
    pinoConfig.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        levelFirst: true,
      },
    };


    // Add file transport for production if enabled
    if (config?.enableFileLogging && process.env.NODE_ENV === 'production') {
      const logDir = config.logDirectory || './logs';
      pinoConfig.transport = {
        targets: [
          {
            target: 'pino/file',
            options: { destination: `${logDir}/app.log` },
            level: 'info',
          },
          {
            target: 'pino/file',
            options: { destination: `${logDir}/error.log` },
            level: 'error',
          },
        ],
      };
    }

    this.logger = pino(pinoConfig);
    this.context = config?.context;
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, data?: any): void {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.info(logData, message);
  }

  error(message: string, error?: Error | any) {
    const errorData: any = { context: this.context };
    
    if (error) {
      if (error instanceof Error) {
        errorData.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorData.error = error;
      }
    }
    this.logger.error(errorData, message);
  }

  warn(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.warn(logData, message);
  }

  debug(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.debug(logData, message);
  }

  verbose(message: string, data?: any) {
    const logData = { context: this.context, ...(data && { data }) };
    this.logger.trace(logData, message);
  }
}
