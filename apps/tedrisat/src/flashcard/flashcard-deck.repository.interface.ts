export interface IFlashcardDeck {
  id: string;
  authorId: string;
  title: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
}

export interface ICreateFlashcardDeck {
  authorId: string;
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
  findById(id: string, include?: Set<string>): Promise<IFlashcardDeck | null>;
  findAll(include?: Set<string>): Promise<IFlashcardDeck[]>;
  create(deck: ICreateFlashcardDeck): Promise<IFlashcardDeck>;
  update(
    id: string,
    updates: IUpdateFlashcardDeck,
  ): Promise<IFlashcardDeck | null>;
  delete(id: string): Promise<boolean>;
}
