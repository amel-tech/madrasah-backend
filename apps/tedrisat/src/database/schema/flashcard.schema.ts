import {
  pgTable as table,
  integer,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { decks } from './flashcard-deck.schema';

export const flashcardTypeEnum = pgEnum('flashcard_type', [
  'VOCABULARY',
  'HADEETH',
]);

export const flashcards = table('flashcards', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  type: flashcardTypeEnum().notNull(),
  authorId: integer('author_id').notNull(),
  deckId: integer('deck_id')
    .references(() => decks.id, { onDelete: 'cascade' })
    .notNull(),
  contentFront: text('content_front').notNull(),
  contentBack: text('content_back').notNull(),
  contentMeta: jsonb('content_meta'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Flashcard = InferSelectModel<typeof flashcards>;
export type NewFlashcard = InferInsertModel<typeof flashcards>;
