import { Module } from '@nestjs/common';
import { AuthGuardModule } from '@madrasah/common';
import { DatabaseService } from '../database/database.service';
import { KoskModule } from '../kosk/kosk.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';

@Module({
  imports: [AuthGuardModule, KoskModule],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository, DatabaseService],
})
export class CourseModule {}
