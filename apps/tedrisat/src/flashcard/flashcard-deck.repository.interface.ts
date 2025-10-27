import { IFlashcardDeckTag } from './flashcard-deck-tag.repository.interface';

export interface IFlashcardDeck {
  id: number;
  authorId: number;
  title: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  tags?: IFlashcardDeckTag[];
}

export interface ICreateFlashcardDeck {
  authorId: number;
  title: string;
  isPublic: boolean;
  description?: string;
}

export interface IUpdateFlashcardDeck {
  title?: string;
  isPublic?: boolean;
  description?: string;
}

export interface IFlashcardDeckRepository {
  findById(id: number, include?: Set<string>): Promise<IFlashcardDeck | null>;
  findAll(include?: Set<string>): Promise<IFlashcardDeck[]>;
  create(deck: ICreateFlashcardDeck): Promise<IFlashcardDeck>;
  update(
    id: number,
    updates: IUpdateFlashcardDeck,
  ): Promise<IFlashcardDeck | null>;
  delete(id: number): Promise<boolean>;
}
