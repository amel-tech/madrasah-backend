import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applyGlobalMiddleware, LoggerFactory } from '@madrasah/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory.create(), // Use LoggerFactory to create a logger instance
  });

  // Apply global middleware
  applyGlobalMiddleware(app);

  const port = process.env.TESKILAT_PORT || 3001;

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Teskilat Service API')
    .setDescription('Organization management service for Madrasah platform')
    .setVersion('1.0.0')
    .addTag('teskilat', 'Organization management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
  console.log(`Teskilat service is running on port ${port}`);
}
bootstrap();
