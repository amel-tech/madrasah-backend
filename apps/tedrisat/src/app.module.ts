import { Module } from '@nestjs/common';
import { LoggerModule, AuthGuardModule } from '@madrasah/common';
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
    AuthGuardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
