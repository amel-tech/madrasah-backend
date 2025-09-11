import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { flashcardDecks } from 'src/database/schema/flashcard-deck.schema';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
  IFlashcardDeckRepository,
} from './flashcard-deck.repository.interface';
import {
  flashcardDeckTags,
  flashcardTags,
} from 'src/database/schema/flashcard-tag.schema';
import { IFlashcardTag } from './flashcard-tag.repository.interface';

@Injectable()
export class FlashcardDeckRepository implements IFlashcardDeckRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: number): Promise<IFlashcardDeck | null> {
    return this.databaseService.db
      .select()
      .from(flashcardDecks)
      .where(eq(flashcardDecks.id, id))
      .then((result) => result[0] || null);
  }

  async findByIdWithTags(id: number): Promise<IFlashcardDeck | null> {
    return this.databaseService.db
      .select()
      .from(flashcardDecks)
      .leftJoin(
        flashcardDeckTags,
        eq(flashcardDecks.id, flashcardDeckTags.deckId),
      )
      .leftJoin(flashcardTags, eq(flashcardDeckTags.tagId, flashcardTags.id))
      .where(eq(flashcardDecks.id, id))
      .then((result) => {
        if (!result.length || !result[0].decks) return null;
        const deck: IFlashcardDeck = {
          ...result[0].decks,
          tags: result
            .map((r) => r.tags)
            .filter((tag): tag is IFlashcardTag => tag != null),
        };
        return deck;
      });
  }

  async create(newDeck: ICreateFlashcardDeck): Promise<IFlashcardDeck> {
    const [createdDeck] = await this.databaseService.db
      .insert(flashcardDecks)
      .values(newDeck)
      .returning();
    return createdDeck;
  }
}
