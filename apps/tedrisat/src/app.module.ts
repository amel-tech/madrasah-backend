import { Module } from '@nestjs/common';
import { LoggerModule, AuthGuard, TestPublicKeyProvider, JwtVerifierService  } from '@madrasah/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'PublicKeyProvider',
      useClass: TestPublicKeyProvider,
    },
    JwtVerifierService,
    AuthGuard,
  ],
})
export class AppModule {}
