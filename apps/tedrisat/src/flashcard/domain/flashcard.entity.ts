import { FlashcardType } from './flashcard-type.enum';

export class Flashcard {
  constructor(
    public readonly id: number,
    public readonly type: FlashcardType,
    public readonly authorId: number,
    public readonly isPublic: boolean,
    public readonly content: Record<string, any>,
    public readonly imageSource?: string,
  ) {}
}
