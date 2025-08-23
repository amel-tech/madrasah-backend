// packages/shared/src/bootstrap/setup-middleware.ts
import {
  INestApplication,
  LoggerService,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import helmet from "helmet";
import compression from "compression";
import { GlobalExceptionFilter } from "../error";
import { MedarisValidationPipe } from "../pipes";

export function applyGlobalMiddleware(
  app: INestApplication,
  logger: LoggerService
) {
  // Enable CORS
  app.enableCors();

  // Security Middlewares
  app.use(helmet());

  // Compression
  app.use(compression());

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Global Validation Pipe
  app.useGlobalPipes(new MedarisValidationPipe());

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
}
