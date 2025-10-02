import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AppModule } from '../../src/app.module';
import {
  GlobalExceptionFilter,
  LoggerFactory,
  MedarisValidationPipe,
} from '@madrasah/common';

// Global container instance to be shared across all tests
let globalPostgresContainer: StartedPostgreSqlContainer | null = null;

// Handle cleanup on process termination
process.on('SIGINT', () => {
  void stopTestDatabase().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void stopTestDatabase().then(() => process.exit(0));
});

/**
 * Starts a PostgreSQL container for testing
 * This container will be reused across all tests to improve performance
 */
export async function startTestDatabase(): Promise<StartedPostgreSqlContainer> {
  if (globalPostgresContainer) {
    return globalPostgresContainer;
  }

  console.log('Starting PostgreSQL container for tests...');

  globalPostgresContainer = await new PostgreSqlContainer('postgres:17-alpine')
    .withDatabase('tedrisat_test')
    .withUsername('testuser')
    .withPassword('testpass')
    .withExposedPorts(5432)
    .start();

  console.log(
    `PostgreSQL container started at ${globalPostgresContainer.getConnectionUri()}`,
  );

  return globalPostgresContainer;
}

/**
 * Stops the global PostgreSQL container
 * This should be called in global test teardown
 */
export async function stopTestDatabase(): Promise<void> {
  if (globalPostgresContainer) {
    console.log('Stopping PostgreSQL container...');
    await globalPostgresContainer.stop();
    globalPostgresContainer = null;
  }
}

/**
 * Test configuration that uses Testcontainers for database
 */
export const getTestConfig = (container: StartedPostgreSqlContainer) => ({
  serviceName: 'tedrisat-test',
  version: '0.1.1-test',
  environment: 'test',
  port: 4001,
  database: {
    host: container.getHost(),
    port: container.getMappedPort(5432),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
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
 * Creates a test application with test configuration using Testcontainers
 */
export async function createTestApp(): Promise<INestApplication> {
  // Start the PostgreSQL container
  const container = await startTestDatabase();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [() => getTestConfig(container)],
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
