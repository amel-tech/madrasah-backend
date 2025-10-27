import { FlashcardProgressStatus } from './domain/flashcard-progress-status.enum';
import { FlashcardType } from './domain/flashcard-type.enum';

export interface IFlashcard {
  id: string;
  deckId: string;
  authorId: string;
  type: FlashcardType;
  contentFront: string;
  contentBack: string;
  contentMeta: unknown;
  createdAt: Date;
  updatedAt: Date;
  progress?: IFlashcardProgress[];
}

export interface ICreateFlashcard {
  deckId: string;
  authorId: string;
  type: FlashcardType;
  contentFront: string;
  contentBack: string;
  contentMeta?: unknown;
}

export interface IUpdateFlashcard {
  type?: FlashcardType;
  contentFront?: string;
  contentBack?: string;
  contentMeta?: unknown;
}

export interface IFlashcardProgress {
  userId: string;
  flashcardId: string;
  status: FlashcardProgressStatus;
  // this will potentially be extended
}

export interface ICreateFlashcardProgress {
  userId: string;
  flashcardId: string;
  status: FlashcardProgressStatus;
}

export interface IFlashcardRepository {
  findById(
    id: string,
    userId: string,
    include?: Set<string>,
  ): Promise<IFlashcard | null>;
  findByDeckId(
    deckId: string,
    userId: string,
    include?: Set<string>,
  ): Promise<IFlashcard[] | null>;
  createMany(cards: ICreateFlashcard[]): Promise<IFlashcard[]>;
  update(id: string, updates: IUpdateFlashcard): Promise<IFlashcard | null>;
  delete(id: string): Promise<boolean>;

  replaceManyProgress(
    updates: ICreateFlashcardProgress[],
  ): Promise<IFlashcardProgress[]>;
}
