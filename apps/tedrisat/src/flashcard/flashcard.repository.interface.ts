import { FlashcardType } from './domain/flashcard-type.enum';

export interface IFlashcard {
  id: number;
  type: FlashcardType;
  authorId: number;
  deckId: number;
  isPublic: boolean;
  contentFront: string;
  contentBack: string;
  contentMeta?: Record<string, unknown>;
}
