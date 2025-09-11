import { IFlashcardTag } from './flashcard-tag.repository.interface';
import { IFlashcard } from './flashcard.repository.interface';

export interface IFlashcardDeck {
  id: number;
  authorId: number;
  title: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  tags?: IFlashcardTag[];
  cards?: IFlashcard[];
}

export interface ICreateFlashcardDeck {
  authorId: number;
  title: string;
  isPublic: boolean;
  description?: string;
}

export interface IUpdateFlashcardDeck {
  authorId?: number;
  title?: string;
  isPublic?: boolean;
  description?: string;
  // tagIds ?
}

export interface IFlashcardDeckRepository {
  findById(id: number): Promise<IFlashcardDeck | null>;
  findByIdWithTags(id: number): Promise<IFlashcardDeck | null>;

  // findAllPublic(includeTags: boolean): Promise<IFlashcardDeck>

  // create(deck: ICreateFlashcardDeck): Promise<IFlashcardDeck>
  // delete(id: number): Promise<boolean>
}
