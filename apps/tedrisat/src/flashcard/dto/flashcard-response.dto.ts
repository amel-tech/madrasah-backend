import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateFlashcardDto } from './create-flashcard.dto';
import { FlashcardProgressResponse } from './flashcard-progress-response.dto';
import { Type } from '@nestjs/class-transformer';

export class FlashcardResponse extends CreateFlashcardDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  deckId!: string;

  @ApiProperty()
  authorId!: string;

  @ApiPropertyOptional({ type: FlashcardProgressResponse, isArray: true })
  @Type(() => FlashcardProgressResponse)
  progress?: FlashcardProgressResponse[];
}
