import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';

export class ReplaceFlashcardDeckDto extends OmitType(CreateFlashcardDeckDto, [
  'tagIds',
] as const) {}

export class UpdateFlashcardDeckDto extends PartialType(
  ReplaceFlashcardDeckDto,
) {}
