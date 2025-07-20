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

  log(message: any) {
    this.logger.info({ context: this.context }, message);
  }

  error(message: any, trace?: string) {
    this.logger.error({ context: this.context, trace }, message);
  }

  warn(message: any) {
    this.logger.warn({ context: this.context }, message);
  }

  debug(message: any) {
    this.logger.debug({ context: this.context }, message);
  }

  verbose(message: any) {
    this.logger.trace({ context: this.context }, message);
  }
}
