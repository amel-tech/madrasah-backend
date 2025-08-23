import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from '../../src/app.module';
import {
  GlobalExceptionFilter,
  LoggerFactory,
  MedarisValidationPipe,
} from '@madrasah/common';

/**
 * Test configuration that overrides database settings for testing
 */
export const getTestConfig = () => ({
  serviceName: 'tedrisat-test',
  version: '0.1.1-test',
  environment: 'test',
  port: 4001,
  database: {
    host: 'localhost',
    port: parseInt('5432'),
    username: 'postgres',
    password: 'postgres',
    database: 'tedrisat-test',
    ssl: false,
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: '',
  },
  logger: {
    level: 'error', // Reduce log noise in tests
    format: 'json',
  },
  otel: {
    enabled: false, // Disable telemetry in tests
    otelEndpoint: 'http://localhost:4317',
    serviceName: 'tedrisat-test',
    serviceVersion: '0.1.1-test',
  },
  swagger: {
    enabled: false, // Disable swagger in tests
    endpoint: '/docs',
  },
  autoMigrations: {
    enabled: true, // Enable auto migrations for tests
    migrationsFolder: join(__dirname, '../../src/database/migrations'), // Relative to this helper file
  },
});

/**
 * Creates a test application with test configuration
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getTestConfig],

        isGlobal: true,
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  const logger = LoggerFactory.create();

  app.useGlobalPipes(new MedarisValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  return app.init();
}
