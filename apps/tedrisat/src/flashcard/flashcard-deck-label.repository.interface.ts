import { Scope } from './domain/flashcard-label.enum';

export interface IFlashcardDeckLabel {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  createdBy: string;
  scope: Scope;
}

export interface ICreateFlashcardDeckLabel {
  title: string;
  scope: Scope;
  userId: string;
  createdBy: string;
}

export interface IFlashcardDeckLabelStats {
  labelId: string;
  usageCount: number;
  lastUsedAt: Date;
}

export interface IFlashcardDeckLabeling {
  id: string;
  labelId: string;
  privateToUserId: string | null;
  deckId: string;
  userId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ICreateFlashcardDeckLabeling {
  labelId: string;
  privateToUserId: string | null;
  deckId: string;
  userId: string;
  createdBy: string;
}

export interface IFlashcardDeckLabelRepository {
  getById(labelId: string): Promise<IFlashcardDeckLabel>;
  create(newLabel: ICreateFlashcardDeckLabel): Promise<IFlashcardDeckLabel>;
  delete(labelId: string): Promise<boolean>;

  deckLabeling(
    newLabeling: ICreateFlashcardDeckLabeling,
  ): Promise<IFlashcardDeckLabeling>;

  createLabelStats(
    useLabel: IFlashcardDeckLabelStats,
  ): Promise<IFlashcardDeckLabelStats>;

  updateLabelStats(labelId: string): Promise<IFlashcardDeckLabelStats>;

  decrementLabelStats(labelId: string): Promise<void>;

  getLabelStats(labelId: string): Promise<IFlashcardDeckLabelStats | null>;

  RemoveDeckLabeling(labelingId: string): Promise<boolean>;

  getLabeling(labelingId: string): Promise<IFlashcardDeckLabeling>;

  getLabelsByDeckId(deckId: string): Promise<IFlashcardDeckLabel[]>;

  getAvailableLabels(userId: string): Promise<IFlashcardDeckLabel[]>;
}
