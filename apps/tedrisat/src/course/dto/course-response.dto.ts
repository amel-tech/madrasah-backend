import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '../domain/course-level.enum';
import { CourseStatus } from '../domain/course-status.enum';
import { EnrollmentStatus } from '../domain/enrollment-status.enum';
import { LessonType } from '../domain/lesson-type.enum';

export class LessonResponse {
  @ApiProperty() id!: string;
  @ApiProperty() weekId!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ enum: LessonType }) type!: LessonType;
  @ApiPropertyOptional({ type: String }) duration!: string | null;
  @ApiPropertyOptional({ type: String }) kaynak!: string | null;
  @ApiProperty() isPreview!: boolean;
  @ApiProperty() orderIndex!: number;
}

export class WeekResponse {
  @ApiProperty() id!: string;
  @ApiProperty() courseId!: string;
  @ApiProperty() weekNumber!: number;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ type: String }) summary!: string | null;
  @ApiProperty() orderIndex!: number;
  @ApiProperty({ type: [LessonResponse] }) lessons!: LessonResponse[];
}

export class MuderrisResponse {
  @ApiProperty() id!: string;
  @ApiProperty() courseId!: string;
  @ApiPropertyOptional({ type: String }) userId!: string | null;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ type: String }) title!: string | null;
  @ApiPropertyOptional({ type: String }) bio!: string | null;
  @ApiProperty() avatarHue!: number;
  @ApiProperty() orderIndex!: number;
}

export class ResourceResponse {
  @ApiProperty() id!: string;
  @ApiProperty() courseId!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ type: String }) meta!: string | null;
  @ApiPropertyOptional({ type: String }) type!: string | null;
  @ApiPropertyOptional({ type: String }) url!: string | null;
  @ApiProperty() orderIndex!: number;
}

export class EnrollmentResponse {
  @ApiProperty() userId!: string;
  @ApiProperty() courseId!: string;
  @ApiProperty({ description: 'Percent complete, 0-100' }) progress!: number;
  @ApiProperty({ enum: EnrollmentStatus }) status!: EnrollmentStatus;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

class CourseBase {
  @ApiProperty() id!: string;
  @ApiProperty() koskId!: string;
  @ApiProperty() authorId!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ type: String }) subtitle!: string | null;
  @ApiPropertyOptional({ type: String }) description!: string | null;
  @ApiPropertyOptional({ type: String }) category!: string | null;
  @ApiProperty({ enum: CourseLevel }) level!: CourseLevel;
  @ApiPropertyOptional({ type: String }) language!: string | null;
  @ApiProperty() coverHue!: number;
  @ApiProperty() durationWeeks!: number;
  @ApiProperty({ enum: CourseStatus }) status!: CourseStatus;
  @ApiProperty() grantsCertificate!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class CourseDetailResponse extends CourseBase {
  @ApiProperty({ type: [WeekResponse] }) weeks!: WeekResponse[];
  @ApiProperty({ type: [MuderrisResponse] }) muderris!: MuderrisResponse[];
  @ApiProperty({ type: [ResourceResponse] }) resources!: ResourceResponse[];
  @ApiPropertyOptional({ type: EnrollmentResponse })
  enrollment!: EnrollmentResponse | null;
}

export class CourseSummaryResponse extends CourseBase {
  @ApiProperty() weekCount!: number;
  @ApiProperty() lessonCount!: number;
  @ApiProperty() resourceCount!: number;
  @ApiProperty({ type: [MuderrisResponse] }) muderris!: MuderrisResponse[];
  @ApiPropertyOptional({ type: EnrollmentResponse })
  enrollment!: EnrollmentResponse | null;
}
