import { PartialType } from '@nestjs/swagger';
import { CreateFlashcardDto } from './create-flashcard.dto';

export class UpdateFlashcardDto extends PartialType(CreateFlashcardDto) {}
