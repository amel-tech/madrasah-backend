import { ApiProperty } from '@nestjs/swagger';
import { CreateFlashcardDto } from './create-flashcard.dto';

export class FlashcardResponse extends CreateFlashcardDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  deckId!: number;

  @ApiProperty()
  authorId!: number;
}
