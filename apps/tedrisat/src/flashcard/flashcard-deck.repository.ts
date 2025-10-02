import { Injectable } from '@nestjs/common';
import { eq, SQL } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { decks } from '../database/schema/flashcard-deck.schema';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
  IFlashcardDeckRepository,
  IUpdateFlashcardDeck,
} from './flashcard-deck.repository.interface';
import { IFlashcardDeckTag } from './flashcard-deck-tag.repository.interface';
import { IFlashcard } from './flashcard.repository.interface';

@Injectable()
export class FlashcardDeckRepository implements IFlashcardDeckRepository {
  private readonly includeMap: Record<string, Record<string, any>> = {
    tags: {
      deckTagsDecks: {
        with: {
          tag: true,
        },
      },
    },
    flashcards: {
      flashcards: true,
    },
    // TODO: handle 'flashcards:user_data' logic
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

    return this.databaseService.db.query.decks
      .findMany({
        where: filter,
        with: withClause,
      })
      .then((results) =>
        results.map((result) => {
          const { deckTagsDecks, flashcards, ...resultBase } = result;
          const transformed: IFlashcardDeck = resultBase;

          if (deckTagsDecks) {
            transformed.tags = (
              deckTagsDecks as { tag: IFlashcardDeckTag }[]
            ).map((dtd) => dtd.tag);
          }
          if (flashcards) {
            transformed.flashcards = flashcards as IFlashcard[];
          }

          return transformed;
        }),
      );
  }

  async findById(
    id: number,
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

  async create(newDeck: ICreateFlashcardDeck): Promise<IFlashcardDeck> {
    const [createdDeck] = await this.databaseService.db
      .insert(decks)
      .values(newDeck)
      .returning();
    return createdDeck;
  }

  async update(
    id: number,
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

  async delete(id: number): Promise<boolean> {
    const deletedDecks = await this.databaseService.db
      .delete(decks)
      .where(eq(decks.id, id))
      .returning();

    return deletedDecks.length ? true : false;
  }
}
