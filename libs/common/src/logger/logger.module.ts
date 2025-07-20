import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { LoggerConfig } from './logger.interface';
import { LoggerFactory, LoggerType } from './logger.factory';

export const LOGGER = 'LOGGER';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(type?: LoggerType, config?: LoggerConfig): DynamicModule {
    const loggerProvider: Provider = {
      provide: LOGGER,
      useFactory: () => {
        return LoggerFactory.create(type, config);
      },
    };

    return {
      module: LoggerModule,
      providers: [loggerProvider],
      exports: [loggerProvider],
    };
  }
}