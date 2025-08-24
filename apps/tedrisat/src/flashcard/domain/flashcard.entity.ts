import { FlashcardType } from './flashcard-type.enum';

export class Flashcard {
  constructor(
    public readonly id: number,
    public readonly type: FlashcardType,
    public readonly author_id: number,
    public readonly is_public: boolean,
    public readonly content: Record<string, any>,
    public readonly image_source?: string,
  ) {}
}
