import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';

export class FlashcardDeckResponse extends OmitType(CreateFlashcardDeckDto, [
  'description',
] as const) {
  @ApiProperty()
  id!: number;

  @ApiPropertyOptional({ type: String })
  description!: string | null;
}
