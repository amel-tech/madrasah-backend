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
import { eq, sql } from 'drizzle-orm';
import { CardIncludeEnum } from './domain/card-include.enum';

/** Overrides for includes that need custom config (e.g. a where clause). */
const cardIncludeOverrides: Partial<
  Record<CardIncludeEnum, (userId: string) => unknown>
> = {
  [CardIncludeEnum.Progress]: (userId) => ({
    where: eq(flashcardProgress.userId, userId),
  }),
};

function buildWith(include: Set<CardIncludeEnum> | undefined, userId: string) {
  if (!include?.size) return {};
  return Object.fromEntries(
    [...include].map((key) => [
      key,
      cardIncludeOverrides[key]?.(userId) ?? true,
    ]),
  );
}

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(
    id: string,
    userId: string,
    include?: Set<CardIncludeEnum>,
  ): Promise<IFlashcard | null> {
    const result = await this.databaseService.db.query.flashcards.findFirst({
      where: eq(flashcards.id, id),
      with: buildWith(include, userId),
    });

    return result || null;
  }

  async findByDeckId(
    deckId: string,
    userId: string,
    include?: Set<CardIncludeEnum>,
  ): Promise<IFlashcard[]> {
    return this.databaseService.db.query.flashcards.findMany({
      where: eq(flashcards.deckId, deckId),
      with: buildWith(include, userId),
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
