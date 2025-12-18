import { Scope } from './domain/flashcard-label.enum';

export interface IFlashcardLabel {
  id: string;
  title: string;
  scope: Scope;
  userId: string;
  createdBy: string;
}
export interface ICreateFlashcardLabel {
  title: string;
  scope: Scope;
  userId: string;
  createdBy: string;
}
export interface IFlashcardLabeling {
  labelId: string;
  privateToUserId: string | null;
  flashcardId: string;
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
    newLabeling: IFlashcardLabeling,
  ): Promise<IFlashcardLabeling>;
  createLabelStats(
    newStats: IFlashcardLabelStats,
  ): Promise<IFlashcardLabelStats>;
  updateLabelStats(labelId: string): Promise<IFlashcardLabelStats>;
  getLabelStats(labelId: string): Promise<IFlashcardLabelStats | null>;
}
