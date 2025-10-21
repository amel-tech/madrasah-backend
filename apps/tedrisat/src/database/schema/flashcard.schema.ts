import {
  pgTable as table,
  integer,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { decks } from './flashcard-deck.schema';
import { FlashcardType } from '../../flashcard/domain/flashcard-type.enum';
import { FlashcardProgressStatus } from '../../flashcard/domain/flashcard-progress-status.enum';

export const flashcardType = pgEnum('flashcard_type', FlashcardType);
export const flaschardProgressStatus = pgEnum(
  'flashcard_user_status',
  FlashcardProgressStatus,
);

// Tables
export const flashcards = table('flashcards', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer('deck_id')
    .references(() => decks.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: integer('author_id').notNull(),
  type: flashcardType().notNull(),
  contentFront: text('content_front').notNull(),
  contentBack: text('content_back').notNull(),
  contentMeta: jsonb('content_meta'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const flashcardProgress = table('flashcard_progress', {
  userId: integer('user_id').notNull(),
  flashcardId: integer('flashcard_id').notNull(),
  status: flaschardProgressStatus()
    .default(FlashcardProgressStatus.NEW)
    .notNull(),
});

// ORM Relations
export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [flashcards.deckId],
    references: [decks.id],
  }),
  progress: many(flashcardProgress),
}));

export const flashcardProgressRelations = relations(
  flashcardProgress,
  ({ one }) => ({
    flashcard: one(flashcards, {
      fields: [flashcardProgress.flashcardId],
      references: [flashcards.id],
    }),
  }),
);
