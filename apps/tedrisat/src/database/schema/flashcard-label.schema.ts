import { pgTable, timestamp, integer, text, uuid } from 'drizzle-orm/pg-core';
import { flashcards } from './flashcard.schema';
import { Scope } from '../../flashcard/domain/flashcard-label.enum';
import { relations } from 'drizzle-orm';
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
export const flashcardLabelings = pgTable('flashcard_labelings', {
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

// ORM Relations
export const flashcardLabelRelations = relations(
  flashcardLabels,
  ({ many }) => ({
    labelings: many(flashcardLabelings),
    stats: many(flashcardLabelStats),
  }),
);

export const flashcardLabelingRelations = relations(
  flashcardLabelings,
  ({ one }) => ({
    label: one(flashcardLabels, {
      fields: [flashcardLabelings.labelId],
      references: [flashcardLabels.id],
    }),

    flashcard: one(flashcards, {
      fields: [flashcardLabelings.flashcardId],
      references: [flashcards.id],
    }),
  }),
);

export const flashcardLabelStatsRelations = relations(
  flashcardLabelStats,
  ({ one }) => ({
    label: one(flashcardLabels, {
      fields: [flashcardLabelStats.labelId],
      references: [flashcardLabels.id],
    }),
  }),
);
