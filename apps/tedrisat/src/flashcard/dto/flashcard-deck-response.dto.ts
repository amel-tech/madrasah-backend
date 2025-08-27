import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';
import { FlashcardTagResponse } from './flashcard-tag-response.dto';
import { FlashcardResponse } from './flashcard-response.dto';

export class FlashcardDeckResponse extends OmitType(CreateFlashcardDeckDto, [
  'tagIds',
] as const) {
  @ApiPropertyOptional()
  tags?: FlashcardTagResponse;
}

export class FlashcardDeckContentResponse extends FlashcardDeckResponse {
  @ApiProperty({ type: FlashcardResponse, isArray: true })
  cards!: FlashcardResponse[];
}
