import { Module } from '@nestjs/common';
import { LoggerModule, AuthGuardModule } from '@madrasah/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';
import { ExampleModule } from './example/example.module';
import { DatabaseModule } from './database/database.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { FlashcardLabelModule } from './flashcard/flashcard-label.module';
import { KoskModule } from './kosk/kosk.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(),
    AuthGuardModule,
    DatabaseModule,
    ExampleModule,
    FlashcardModule,
    FlashcardLabelModule,
    KoskModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
