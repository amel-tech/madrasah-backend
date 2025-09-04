import { PartialType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';

export class UpdateFlashcardDeckDto extends PartialType(
  CreateFlashcardDeckDto,
) {}
