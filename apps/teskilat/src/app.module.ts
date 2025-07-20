import { Module } from '@nestjs/common';
import { LoggerModule } from '@madrasah/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [LoggerModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
