import { ErrorContext, NotFoundError } from '@madrasah/common';

export class CourseNotFoundError extends NotFoundError {
  static readonly code = 'COURSE_NOT_FOUND';

  constructor(courseId: string, context?: ErrorContext) {
    super(
      CourseNotFoundError.code,
      `Course with id ${courseId} not found`,
      context,
    );
  }
}
