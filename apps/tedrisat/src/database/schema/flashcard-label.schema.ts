import { pgTable, timestamp, integer, text, uuid } from 'drizzle-orm/pg-core';
import { flashcards } from './flashcard.schema';
import { Scope } from '../../flashcard/domain/flashcard-label.enum';
export const flashcardLabels = pgTable('flashcard_labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('name').notNull(),
  scope: text('scope').$type<Scope>().notNull(),
  userId: uuid('user_id').notNull(),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const flashcardLabelStats = pgTable('flashcard_label_stats', {
  id: uuid('id').primaryKey().defaultRandom(),

  labelId: uuid('label_id')
    .notNull()
    .references(() => flashcardLabels.id, { onDelete: 'cascade' }),

  usageCount: integer('usage_count').notNull().default(0),

  lastUsedAt: timestamp('last_used_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
});
export const flashcardLabelings = pgTable('Flashcard_labeling', {
  id: uuid('id').primaryKey().defaultRandom(),

  labelId: uuid('label_id')
    .notNull()
    .references(() => flashcardLabels.id, { onDelete: 'cascade' }),

  privateToUserId: uuid('private_to_user_id'),

  flashcardId: uuid('flashcard_id')
    .references(() => flashcards.id, {
      onDelete: 'set null',
    })
    .notNull(),

  createdBy: uuid('created_by').notNull(),

  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});
