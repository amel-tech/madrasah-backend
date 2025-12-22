import { ApiProperty } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { FlashcardResponse } from './flashcard-response.dto';

export class BulkFlashcardResponse {
  @ApiProperty({ type: () => FlashcardResult, isArray: true })
  flashcards!: FlashcardResult[];

  @ApiProperty()
  isSuccess: boolean = false;

  @ApiProperty()
  errorMessage?: string;
}

export class FlashcardResult {
  @ApiProperty()
  success!: boolean;

  @ApiProperty({ type: () => ValidationError, isArray: true })
  errors?: ValidationError[] | null;

  @ApiProperty()
  flashCardResponse?: FlashcardResponse;
}
