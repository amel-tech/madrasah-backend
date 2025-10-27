import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';
import { FlashcardTagResponse } from './flashcard-tag-response.dto';
import { Type } from '@nestjs/class-transformer';

export class FlashcardDeckResponse extends OmitType(CreateFlashcardDeckDto, [
  'description',
  'tagIds',
] as const) {
  @ApiProperty()
  id!: number;

  @ApiPropertyOptional({ type: String })
  description!: string | null;

  @ApiPropertyOptional({ type: FlashcardTagResponse, isArray: true })
  @Type(() => FlashcardTagResponse)
  tags?: FlashcardTagResponse[];
}
