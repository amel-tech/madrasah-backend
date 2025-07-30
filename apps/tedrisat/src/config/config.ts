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
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'tedrisat',
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
    endpoint: process.env.SWAGGER_ENDPOINT || '/docs',
  },
});
