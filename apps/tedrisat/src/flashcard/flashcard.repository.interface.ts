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

export interface IFlashcardRepository {
  findById(id: number, include?: Set<string>): Promise<IFlashcard | null>;
  createMany(cards: ICreateFlashcard[]): Promise<IFlashcard[]>;
  update(id: number, updates: IUpdateFlashcard): Promise<IFlashcard | null>;
  delete(id: number): Promise<boolean>;
}
