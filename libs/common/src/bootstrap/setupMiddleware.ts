// packages/shared/src/bootstrap/setup-middleware.ts
import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

export function applyGlobalMiddleware(app: INestApplication) {
  // Enable CORS
  app.enableCors();

  // Security Middlewares
  app.use(helmet());

  // Compression
  app.use(compression());

  // Enable shutdown hooks
  app.enableShutdownHooks();
}
