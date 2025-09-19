import {
  pgTable as table,
  integer,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { decks } from './flashcard-deck.schema';
import { FlashcardType } from '../../flashcard/domain/flashcard-type.enum';
import { relations } from 'drizzle-orm';

export const flashcardTypeEnum = pgEnum('flashcard_type', FlashcardType);

// Tables
export const flashcards = table('flashcards', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer('deck_id')
    .references(() => decks.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: integer('author_id').notNull(),
  type: flashcardTypeEnum().notNull(),
  contentFront: text('content_front').notNull(),
  contentBack: text('content_back').notNull(),
  contentMeta: jsonb('content_meta'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ORM Relations
export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  deck: one(decks, {
    fields: [flashcards.deckId],
    references: [decks.id],
  }),
}));
