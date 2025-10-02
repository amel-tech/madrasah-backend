import { FlashcardType } from './flashcard-type.enum';

export class Flashcard {
  constructor(
    public readonly type: FlashcardType,
    public readonly authorId: number,
    public readonly deckId: number,
    public readonly isPublic: boolean,
    public readonly contentFront: string,
    public readonly contentBack: string,
    public readonly contentMeta?: Record<string, unknown>,
  ) {}
}
