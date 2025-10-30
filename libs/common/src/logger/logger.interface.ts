import { LoggerService } from "@nestjs/common";

export interface ILogger extends LoggerService {
  log(message: string, data?: any): void;
  error(message: string, error?: Error | any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  verbose(message: string, data?: any): void;
  setContext(context: string): void;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LoggerConfig {
  level?: LogLevel;
  name?: string;
  context?: string; // Optional, used to set a default context for all logs
  prettyPrint?: boolean;
  timestamp?: boolean; // Optional, defaults to true
  logDirectory?: string;
  enableFileLogging?: boolean;
}
