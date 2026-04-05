import { Injectable } from '@nestjs/common';
import { and, eq, exists, or, SQL } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { decks, decksUsers } from '../database/schema/flashcard-deck.schema';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
  IFlashcardDeckFilters,
  IFlashcardDeckRepository,
  IFlashcardDeckUserCollectionItem,
  IUpdateFlashcardDeck,
} from './flashcard-deck.repository.interface';

@Injectable()
export class FlashcardDeckRepository implements IFlashcardDeckRepository {
  private readonly includeMap: Record<string, Record<string, any>> = {
    // matching keys are replaced with their content to populate "with" field in db.query API
  } as const;

  constructor(private readonly databaseService: DatabaseService) {}

  async findByFilter(
    filter: SQL,
    include?: Set<string>,
  ): Promise<IFlashcardDeck[]> {
    const withClause: Record<string, any> = {};

    if (include) {
      for (const relation of include) {
        const relationConfig = this.includeMap[relation];
        if (relationConfig) {
          Object.assign(withClause, relationConfig);
        }
      }
    }

    return this.databaseService.db.query.decks.findMany({
      where: filter,
      with: withClause,
    });
  }

  async findById(
    id: string,
    include?: Set<string>,
  ): Promise<IFlashcardDeck | null> {
    return this.findByFilter(eq(decks.id, id), include).then(
      (result) => result[0] || null,
    );
  }

  async findAll(include?: Set<string>): Promise<IFlashcardDeck[]> {
    // TODO: handle pagination
    return this.findByFilter(eq(decks.isPublic, true), include);
  }

  async findAllVisibleToUser(
    userId: string,
    filters?: IFlashcardDeckFilters,
    include?: Set<string>,
  ): Promise<IFlashcardDeck[]> {
    // TODO: handle pagination
    const { isPublic } = filters ?? {};

    let where: SQL;
    if (isPublic === true) {
      where = eq(decks.isPublic, true);
    } else if (isPublic === false) {
      where = and(eq(decks.authorId, userId), eq(decks.isPublic, false))!;
    } else {
      where = or(eq(decks.isPublic, true), eq(decks.authorId, userId))!;
    }

    return this.findByFilter(where, include);
  }

  async findAllByUser(userId: string): Promise<IFlashcardDeck[]> {
    return this.databaseService.db.query.decks.findMany({
      with: {
        decksUsers: true,
      },
      where: exists(
        // using simple `eq(decksUsers.userId, userId)` instead of `exists(...)` causes bug in drizzle
        this.databaseService.db
          .select()
          .from(decksUsers)
          .where(
            and(eq(decksUsers.deckId, decks.id), eq(decksUsers.userId, userId)),
          ),
      ),
    });
  }

  async create(newDeck: ICreateFlashcardDeck): Promise<IFlashcardDeck> {
    const [createdDeck] = await this.databaseService.db
      .insert(decks)
      .values(newDeck)
      .returning();
    return createdDeck;
  }

  async addToUserCollection(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUserCollectionItem> {
    const [createdUser] = await this.databaseService.db
      .insert(decksUsers)
      .values({ userId, deckId })
      .returning();
    return createdUser;
  }

  async update(
    id: string,
    updates: IUpdateFlashcardDeck,
  ): Promise<IFlashcardDeck | null> {
    // TODO?: verify deck author
    return this.databaseService.db
      .update(decks)
      .set(updates)
      .where(eq(decks.id, id))
      .returning()
      .then((result) => result[0] || null);
  }

  async delete(id: string): Promise<boolean> {
    const deletedDecks = await this.databaseService.db
      .delete(decks)
      .where(eq(decks.id, id))
      .returning();

    return deletedDecks.length ? true : false;
  }

  async removeFromUserCollection(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUserCollectionItem> {
    const [deletedUser] = await this.databaseService.db
      .delete(decksUsers)
      .where(and(eq(decksUsers.userId, userId), eq(decksUsers.deckId, deckId)))
      .returning();
    return deletedUser;
  }
}
