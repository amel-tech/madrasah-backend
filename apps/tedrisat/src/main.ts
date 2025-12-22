import './otel';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applyGlobalMiddleware, LoggerFactory } from '@madrasah/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = LoggerFactory.create();
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.useLogger(logger);

  applyGlobalMiddleware(app, logger);

  const config = app.get(ConfigService);
  const port = config.get<number>('port') || 3001;
  // Swagger configuration
  const swaggerEnabled = config.get<boolean>('swagger.enabled');
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .addBearerAuth()
      .addOAuth2(
        {
          type: 'oauth2',
          flows: {
            implicit: {
              // eslint-disable-next-line prettier/prettier
              authorizationUrl: config.get<string>('KEYCLOAK_JWKS_URL')?.replace('/certs', '/auth'),
              // eslint-disable-next-line prettier/prettier
              tokenUrl: config.get<string>('KEYCLOAK_JWKS_URL')?.replace('/certs', '/token'),
              scopes: {},
            },
          },
        },
        'bearer',
      )
      .setTitle('Tedrisat Service API')
      .setDescription('Education management service for Madrasah platform')
      .setVersion(config.get<string>('version') || '1.0.0')
      .addTag('tedrisat', 'Education management endpoints')
      .build();
    // eslint-disable-next-line prettier/prettier
    const swaggerEndpoint = config.get<string>('swagger.endpoint') || '/swagger';
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    app.use((req: any, res: any, next: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, prettier/prettier
      if (req.url.startsWith(swaggerEndpoint) || req.url.includes('oauth2-redirect.html')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        res.removeHeader('Content-Security-Policy');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        res.removeHeader('cross-origin-opener-policy');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      next();
    });
    SwaggerModule.setup(swaggerEndpoint, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        // eslint-disable-next-line prettier/prettier
        oauth2RedirectUrl: 'http://localhost:' + port + swaggerEndpoint + '/oauth2-redirect.html',
        initOAuth: {
          clientId: config.get<string>('KEYCLOAK_CLIENT_ID'),
          appName: 'Ameltech Keycloak Login',
          usePkceWithAuthorizationCodeGrant: true,
        },
      },
    });
  }

  await app.listen(port);
  console.log(`Tedrisat service is running on port ${port}`);
}

void bootstrap();
