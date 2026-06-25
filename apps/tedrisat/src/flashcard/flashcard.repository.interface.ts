import { CardIncludeEnum } from './domain/card-include.enum';
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

export interface IFlashcardWithDeckVisibility {
  cardId: string;
  deckId: string;
  isPublic: boolean;
  authorId: string;
}

export interface IFlashcardRepository {
  findById(
    id: string,
    userId: string,
    include?: Set<CardIncludeEnum>,
  ): Promise<IFlashcard | null>;
  findByDeckId(
    deckId: string,
    userId: string,
    include?: Set<CardIncludeEnum>,
  ): Promise<IFlashcard[] | null>;
  createMany(cards: ICreateFlashcard[]): Promise<IFlashcard[]>;
  update(id: string, updates: IUpdateFlashcard): Promise<IFlashcard | null>;
  delete(id: string): Promise<boolean>;

  replaceManyProgress(
    updates: ICreateFlashcardProgress[],
  ): Promise<IFlashcardProgress[]>;

  /** Join each requested card with its parent deck and return the
   *  visibility-relevant fields. Used by progress writes to verify the
   *  caller can reach every card in a batch before persisting. */
  findVisibilityByIds(
    cardIds: string[],
  ): Promise<IFlashcardWithDeckVisibility[]>;
}
