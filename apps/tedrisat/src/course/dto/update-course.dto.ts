import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

// Course-level fields only; nested weeks/muderris/resources are managed separately.
export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['weeks', 'muderris', 'resources'] as const),
) {}
