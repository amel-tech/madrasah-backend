import { FlashcardProgressStatus } from './domain/flashcard-progress-status.enum';
import { FlashcardType } from './domain/flashcard-type.enum';

export interface IFlashcard {
  id: number;
  deckId: number;
  authorId: number;
  type: FlashcardType;
  contentFront: string;
  contentBack: string;
  contentMeta: unknown;
  createdAt: Date;
  updatedAt: Date;
  progress?: IFlashcardProgress[];
}

export interface ICreateFlashcard {
  deckId: number;
  authorId: number;
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
  userId: number;
  flashcardId: number;
  status: FlashcardProgressStatus;
  // this will potentially be extended
}

export interface ICreateFlashcardProgress {
  userId: number;
  flashcardId: number;
  status: FlashcardProgressStatus;
}

export interface IFlashcardRepository {
  findById(
    id: number,
    userId: number,
    include?: Set<string>,
  ): Promise<IFlashcard | null>;
  findByDeckId(
    deckId: number,
    userId: number,
    include?: Set<string>,
  ): Promise<IFlashcard[] | null>;
  createMany(cards: ICreateFlashcard[]): Promise<IFlashcard[]>;
  update(id: number, updates: IUpdateFlashcard): Promise<IFlashcard | null>;
  delete(id: number): Promise<boolean>;

  replaceManyProgress(
    updates: ICreateFlashcardProgress[],
  ): Promise<IFlashcardProgress[]>;
}
