import { HttpStatus } from '@nestjs/common';
import { MedarisError } from '@madrasah/common';
import { RowError } from '../dto/flashcard-bulk-response.dto';

export class BulkValidationError extends MedarisError {
  static readonly code = 'BULK_VALIDATION_ERROR';

  constructor(errors: RowError[]) {
    super(BulkValidationError.code, HttpStatus.UNPROCESSABLE_ENTITY, 'Validation Error', {
      errors,
    });
  }
}
