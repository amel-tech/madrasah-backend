import { Injectable } from '@nestjs/common';
import {
  ICreateFlashcard,
  IFlashcard,
  IFlashcardRepository,
  IUpdateFlashcard,
} from './flashcard.repository.interface';
import { DatabaseService } from '../database/database.service';
import { flashcards } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: number): Promise<IFlashcard | null> {
    return this.databaseService.db.query.flashcards
      .findFirst({
        where: eq(flashcards.id, id),
      })
      .then((result) => result || null);
  }

  async createMany(cards: ICreateFlashcard[]): Promise<IFlashcard[]> {
    return this.databaseService.db.insert(flashcards).values(cards).returning();
  }

  async update(
    id: number,
    updates: IUpdateFlashcard,
  ): Promise<IFlashcard | null> {
    return this.databaseService.db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, id))
      .returning()
      .then((result) => result[0] || null);
  }

  async delete(id: number): Promise<boolean> {
    const deletedCards = await this.databaseService.db
      .delete(flashcards)
      .where(eq(flashcards.id, id))
      .returning();

    return deletedCards.length ? true : false;
  }
}
