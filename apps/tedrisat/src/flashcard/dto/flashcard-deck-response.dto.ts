import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';
import { FlashcardTagResponse } from './flashcard-tag-response.dto';
import { FlashcardResponse } from './flashcard-response.dto';
import { Type } from '@nestjs/class-transformer';

export class FlashcardDeckResponse extends OmitType(CreateFlashcardDeckDto, [
  'description',
  'tagIds',
] as const) {
  @ApiProperty()
  description!: string | null;

  @ApiPropertyOptional({ type: FlashcardTagResponse, isArray: true })
  @Type(() => FlashcardTagResponse)
  tags?: FlashcardTagResponse[];

  @ApiPropertyOptional({ type: FlashcardResponse, isArray: true })
  @Type(() => FlashcardResponse)
  flashcards?: FlashcardResponse[];
}
