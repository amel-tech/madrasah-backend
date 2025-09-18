import {
  pgTable as table,
  integer,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { deckTagsDecks } from './flashcard-deck-tag.schema';

// Tables
export const decks = table('decks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  authorId: integer('author_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ORM Relations
export const decksRelations = relations(decks, ({ many }) => ({
  deckTagsDecks: many(deckTagsDecks),
}));
