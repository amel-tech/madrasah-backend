import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  applyGlobalMiddleware,
  LoggerFactory,
  LoggerType,
} from '@madrasah/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory.create(), // Use LoggerFactory to create a logger instance
  });

  applyGlobalMiddleware(app);

  const port = process.env.TEDRISAT_PORT || 3002;

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tedrisat Service API')
    .setDescription('Education management service for Madrasah platform')
    .setVersion('1.0.0')
    .addTag('tedrisat', 'Education management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
  console.log(`Tedrisat service is running on port ${port}`);
}
bootstrap();
