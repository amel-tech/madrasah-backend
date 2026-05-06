import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
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
 * Starts a PostgreSQL container for testing and exports its connection details
 * as environment variables so that AppModule's own ConfigModule picks them up.
 * The container is reused across all tests to improve performance.
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

  // Must be set BEFORE AppModule is imported/compiled so that
  // configuration() reads these values instead of the defaults.
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = globalPostgresContainer.getHost();
  process.env.DB_PORT = String(globalPostgresContainer.getMappedPort(5432));
  process.env.DB_USERNAME = globalPostgresContainer.getUsername();
  process.env.DB_PASSWORD = globalPostgresContainer.getPassword();
  process.env.DB_NAME = globalPostgresContainer.getDatabase();
  process.env.DB_SSL = 'false';
  process.env.AUTO_MIGRATIONS_ENABLED = 'true';
  process.env.AUTO_MIGRATIONS_FOLDER = join(
    __dirname,
    '../../src/database/migrations',
  );
  process.env.LOG_LEVEL = 'info';
  process.env.OTEL_ENABLED = 'false';
  process.env.SWAGGER_ENABLED = 'false';
  process.env.KEYCLOAK_JWKS_URL =
    'https://auth.medaris.app/realms/amel-tech-dev/protocol/openid-connect/certs';

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
 * Creates a test application backed by the Testcontainers postgres instance.
 * AppModule is imported after environment variables are populated so its
 * ConfigModule reads the container's connection details directly.
 */
export async function createTestApp(): Promise<INestApplication> {
  await startTestDatabase();

  // Import AppModule lazily so configuration() runs after env vars are set.
  const { AppModule } = await import('../../src/app.module');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  const logger = LoggerFactory.create();

  app.useGlobalPipes(new MedarisValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  return app.init();
}
