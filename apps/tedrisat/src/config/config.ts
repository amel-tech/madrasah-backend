import * as pkg from '../../package.json';

const version = pkg.version || '0.0.1';

export default () => ({
  serviceName: process.env.SERVICE_NAME || pkg.name,
  version,
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'tedrisat',
    password: process.env.DB_PASSWORD || 'tedrisat',
    database: process.env.DB_NAME || 'tedrisat_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  otel: {
    enabled: process.env.OTEL_ENABLED === 'true' || false,
    otelEndpoint:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    serviceName: process.env.SERVICE_NAME || pkg.name,
    serviceVersion: version,
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    endpoint: process.env.SWAGGER_PATH || '/docs',
  },
  autoMigrations: {
    enabled: process.env.AUTO_MIGRATIONS === 'true' || false,
    migrationsFolder:
      process.env.AUTO_MIGRATIONS_FOLDER || './src/database/migrations',
  },
  keycloak: {
    // TODO: Remove this default value, after providing a keycloak container for test in CI.
    jwksUrl: process.env.KEYCLOAK_JWKS_URL || 'test-url',
    cacheTtl: process.env.KEYCLOAK_CACHE_TTL || '86400',
    notFoundCacheTtl: process.env.KEYCLOAK_NOT_FOUND_CACHE_TTL || '120',
  },
});
