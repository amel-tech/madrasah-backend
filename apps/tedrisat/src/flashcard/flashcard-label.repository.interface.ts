import { Scope } from './domain/flashcard-label.enum';

export interface IFlashcardLabel {
  id: string;
  title: string;
  scope: Scope;
  userId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ICreateFlashcardLabel {
  title: string;
  scope: Scope;
  userId: string;
  createdBy: string;
}

export interface IFlashcardLabeling {
  id: string;
  labelId: string;
  privateToUserId: string | null;
  flashcardId: string;
  userId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ICreateFlashcardLabeling {
  labelId: string;
  privateToUserId: string | null;
  flashcardId: string;
  userId: string;
  createdBy: string;
}

export interface IFlashcardLabelStats {
  labelId: string;
  usageCount: number;
  lastUsedAt: Date;
}

export interface IFlashcardLabelRepository {
  getById(labelId: string): Promise<IFlashcardLabel | null>;

  delete(labelId: string): Promise<boolean>;

  createLabel(newlabel: ICreateFlashcardLabel): Promise<IFlashcardLabel>;

  flashcardLabeling(
    newLabeling: ICreateFlashcardLabeling,
  ): Promise<IFlashcardLabeling>;

  createLabelStats(
    newStats: IFlashcardLabelStats,
  ): Promise<IFlashcardLabelStats>;

  updateLabelStats(labelId: string): Promise<IFlashcardLabelStats>;

  decrementLabelStats(labelId: string): Promise<void>;

  getLabelStats(labelId: string): Promise<IFlashcardLabelStats | null>;

  RemoveLabeling(labelingId: string): Promise<boolean>;

  getLabeling(labelingId: string): Promise<IFlashcardLabeling>;

  getLabelsByFlashcardId(flashcardId: string): Promise<IFlashcardLabel[]>;

  getAvailableLabels(userId: string): Promise<IFlashcardLabel[]>;
}
