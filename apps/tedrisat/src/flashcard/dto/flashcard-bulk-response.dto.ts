import { ApiProperty } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { ErrorResponse } from '@madrasah/common';

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
}

export class BulkFlashcardErrorContext {
  @ApiProperty({ type: () => RowError, isArray: true })
  errors!: RowError[];
}

export class BulkFlashcardErrorResponse extends OmitType(ErrorResponse, ['context'] as const) {
  @ApiProperty({ type: () => BulkFlashcardErrorContext })
  context!: BulkFlashcardErrorContext;
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
