import {
  pgTable as table,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { flashcards } from './flashcard.schema';

// Tables
export const decks = table('decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ORM Relations
export const decksRelations = relations(decks, ({ many }) => ({
  flashcards: many(flashcards),
}));
