import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';

export class FlashcardDeckResponse extends OmitType(CreateFlashcardDeckDto, [
  'description',
] as const) {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ type: String })
  description!: string | null;
}
