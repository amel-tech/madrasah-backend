import { ApiProperty } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';

export class FieldError {
  @ApiProperty({ example: 'front' })
  field!: string;

  @ApiProperty({ example: 'front should not be empty' })
  message!: string;
}

export class RowError {
  @ApiProperty({ description: 'Row number in the uploaded file (1-based)' })
  row!: number;

  @ApiProperty({ type: () => FieldError, isArray: true })
  errors!: FieldError[];
}

export class BulkFlashcardResponse {
  @ApiProperty({ description: 'Number of successfully imported flashcards' })
  count!: number;

  @ApiProperty()
  isSuccess: boolean = false;
}

export class BulkFlashcardErrorContext {
  @ApiProperty({ type: () => RowError, isArray: true })
  errors!: RowError[];
}

export class BulkFlashcardErrorResponse {
  @ApiProperty({ example: 'APP_ERROR' })
  type!: string;

  @ApiProperty({ example: 'BULK_VALIDATION_ERROR' })
  code!: string;

  @ApiProperty({ example: 422 })
  status!: number;

  @ApiProperty({ example: 'Validation Error' })
  message!: string;

  @ApiProperty({ type: () => BulkFlashcardErrorContext })
  context!: BulkFlashcardErrorContext;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export function flattenValidationErrors(errors: ValidationError[]): FieldError[] {
  return errors.flatMap((error) => {
    if (error.constraints) {
      return Object.values(error.constraints).map((message) => ({
        field: error.property,
        message,
      }));
    }
    if (error.children?.length) {
      return flattenValidationErrors(error.children).map((e) => ({
        field: `${error.property}.${e.field}`,
        message: e.message,
      }));
    }
    return [];
  });
}
