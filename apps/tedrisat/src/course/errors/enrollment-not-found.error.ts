import { ErrorContext, NotFoundError } from '@madrasah/common';

export class EnrollmentNotFoundError extends NotFoundError {
  static readonly code = 'ENROLLMENT_NOT_FOUND';

  constructor(courseId: string, context?: ErrorContext) {
    super(
      EnrollmentNotFoundError.code,
      `No enrollment found for course ${courseId}`,
      context,
    );
  }
}
