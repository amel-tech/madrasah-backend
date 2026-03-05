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

export interface IFlashcardDeckUserCollectionItem {
  // interface for `decks_users` table
  // referred as `collection`
  userId: string;
  deckId: string;
  createdAt: Date;
}

export interface IFlashcardDeckRepository {
  // SELECT
  findById(id: string, include?: Set<string>): Promise<IFlashcardDeck | null>;
  findAll(include?: Set<string>): Promise<IFlashcardDeck[]>;
  findAllByUser(userId: string): Promise<IFlashcardDeck[]>; // not by author

  // INSERT
  create(deck: ICreateFlashcardDeck): Promise<IFlashcardDeck>;
  addToUserCollection(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUserCollectionItem>;

  // UPDATE
  update(
    id: string,
    updates: IUpdateFlashcardDeck,
  ): Promise<IFlashcardDeck | null>;

  // DELETE
  delete(id: string): Promise<boolean>;
  removeFromUserCollection(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUserCollectionItem>;
}
