import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFlashcardDeckDto } from './create-flashcard-deck.dto';

/**
 * Visibility (`isPublic`) is set at creation time and cannot be flipped
 * by a subsequent PATCH or PUT — publishing a private deck to global
 * would let an owner sidestep the matrix's SYSTEM_ADMIN-only rules on
 * managing a public deck. A dedicated publish endpoint (admin-only)
 * will land separately.
 */
export class ReplaceFlashcardDeckDto extends OmitType(CreateFlashcardDeckDto, [
  'isPublic',
] as const) {}

export class UpdateFlashcardDeckDto extends PartialType(
  ReplaceFlashcardDeckDto,
) {}
