import './otel';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line prettier/prettier
import { applyGlobalMiddleware, HttpExceptionFilter, LoggerFactory } from '@madrasah/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import dictionary from './dictionary';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory.create(), // Use LoggerFactory to create a logger instance
  });

  app.useGlobalFilters(new HttpExceptionFilter({ dictionary: dictionary }));
  const config = app.get(ConfigService);

  // Apply global middleware
  applyGlobalMiddleware(app);

  const swaggerEnabled = config.get<boolean>('swagger.enabled');
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Tedrisat Service API')
      .setDescription('Education management service for Madrasah platform')
      .setVersion('1.0.0')
      .addTag('tedrisat', 'Education management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerEndpoint =
      config.get<string>('swagger.endpoint') || '/swagger';
    SwaggerModule.setup(swaggerEndpoint, app, document);
  }

  const port = config.get<number>('port') || 3002;

  await app.listen(port);
  console.log(`Tedrisat service is running on port ${port}`);
}

void bootstrap();
