import {
  pgTable as table,
  integer,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const flashcardDecks = table('decks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  authorId: integer('author_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FlashcardDeck = InferSelectModel<typeof flashcardDecks>;
export type NewFlashcardDeck = InferInsertModel<typeof flashcardDecks>;
