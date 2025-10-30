import { Injectable } from '@nestjs/common';
import {
  ICreateFlashcard,
  ICreateFlashcardProgress,
  IFlashcard,
  IFlashcardProgress,
  IFlashcardRepository,
  IUpdateFlashcard,
} from './flashcard.repository.interface';
import { DatabaseService } from '../database/database.service';
import { flashcardProgress, flashcards } from '../database/schema';
import { and, eq, sql } from 'drizzle-orm';

function fillWith(include?: Set<string>) {
  return Object.fromEntries([...(include ?? [])].map((item) => [item, true]));
}

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(
    id: string,
    userId: string,
    include?: Set<string>,
  ): Promise<IFlashcard | null> {
    const filterByUser = (include ?? new Set()).has('progress');
    const filter = and(
      eq(flashcards.id, id),
      filterByUser ? eq(flashcardProgress.userId, userId) : undefined,
    );

    return this.databaseService.db.query.flashcards
      .findFirst({
        where: filter,
        with: fillWith(include),
      })
      .then((result) => result || null);
  }

  async findByDeckId(
    deckId: string,
    userId: string,
    include?: Set<string>,
  ): Promise<IFlashcard[]> {
    const filterByUser = (include ?? new Set()).has('progress');
    const filter = and(
      eq(flashcards.deckId, deckId),
      filterByUser ? eq(flashcardProgress.userId, userId) : undefined,
    );

    return this.databaseService.db.query.flashcards.findMany({
      where: filter,
      with: fillWith(include),
    });
  }

  async createMany(cards: ICreateFlashcard[]): Promise<IFlashcard[]> {
    return this.databaseService.db.insert(flashcards).values(cards).returning();
  }

  async update(
    id: string,
    updates: IUpdateFlashcard,
  ): Promise<IFlashcard | null> {
    return this.databaseService.db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, id))
      .returning()
      .then((result) => result[0] || null);
  }

  async delete(id: string): Promise<boolean> {
    const deletedCards = await this.databaseService.db
      .delete(flashcards)
      .where(eq(flashcards.id, id))
      .returning();

    return deletedCards.length ? true : false;
  }

  // flashcard-progress

  async replaceManyProgress(
    updates: ICreateFlashcardProgress[],
  ): Promise<IFlashcardProgress[]> {
    return this.databaseService.db
      .insert(flashcardProgress)
      .values(updates)
      .onConflictDoUpdate({
        target: [flashcardProgress.userId, flashcardProgress.flashcardId],
        set: { status: sql.raw(`excluded.${flashcardProgress.status.name}`) },
      })
      .returning();
  }
}
