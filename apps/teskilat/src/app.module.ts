import { Module } from '@nestjs/common';
import { LoggerModule, LoggerType } from '@madrasah/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [LoggerModule.forRoot(LoggerType.WINSTON)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
