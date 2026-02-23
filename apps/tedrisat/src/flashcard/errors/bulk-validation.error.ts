import { HttpStatus } from '@nestjs/common';
import { RawBodyError } from '@madrasah/common';
import { BulkFlashcardErrorResponse } from '../dto/flashcard-bulk-response.dto';

export class BulkValidationError extends RawBodyError<BulkFlashcardErrorResponse> {
  static readonly code = 'BULK_VALIDATION_ERROR';

  constructor(body: BulkFlashcardErrorResponse) {
    super(BulkValidationError.code, HttpStatus.UNPROCESSABLE_ENTITY, 'Validation Error', body);
  }
}
