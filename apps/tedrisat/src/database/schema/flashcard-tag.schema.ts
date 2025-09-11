import {
  pgTable as table,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { flashcardDecks } from './flashcard-deck.schema';

export const flashcardTags = table('tags', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FlashcardTag = InferSelectModel<typeof flashcardTags>;
export type NewFlashcardTag = InferInsertModel<typeof flashcardTags>;

export const flashcardDeckTags = table('deck_tags', {
  deckId: integer('deck_id')
    .references(() => flashcardDecks.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: integer('tag_id')
    .references(() => flashcardTags.id, { onDelete: 'cascade' })
    .notNull(),
});

export type FlashcardDeckTag = InferSelectModel<typeof flashcardDeckTags>;
export type NewFlashcardDeckTag = InferInsertModel<typeof flashcardDeckTags>;
