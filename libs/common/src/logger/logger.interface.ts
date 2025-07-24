import { LoggerService } from "@nestjs/common";

export interface ILogger extends LoggerService {
  log(message: any, context?: string): void;
  error(message: any, trace?: string, context?: string): void;
  warn(message: any, context?: string): void;
  debug(message: any, context?: string): void;
  verbose(message: any, context?: string): void;
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
