import {
  pgTable as table,
  integer,
  text,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { decks } from './flashcard-deck.schema';
import { Scope } from '../../flashcard/domain/flashcard-label.enum';

// Tables
export const deckLabels = table('deck_label', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  scope: text('scope').$type<Scope>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').notNull(),
});

export const deckLabelings = table('deck_labelings', {
  id: uuid('id').primaryKey().defaultRandom(),
  labelId: uuid('label_id')
    .notNull()
    .references(() => deckLabels.id, { onDelete: 'cascade' }),
  privateToUserId: uuid('private_to_user_id').notNull(),
  deckId: uuid('deck_id')
    .notNull()
    .references(() => decks.id, {
      onDelete: 'cascade',
    }),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('create_at').notNull(),
});

export const deckLabelsStats = table('deck_label_stats', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),

  lableId: uuid('lable_id')
    .notNull()
    .references(() => deckLabels.id, { onDelete: 'cascade' }),

  usageCount: integer('usage_count').notNull().default(0),

  lastUsedAt: timestamp('last_used_at', { mode: 'date' }).notNull(),
});

export const deckLabelsDecks = table('deck_labels_decks', {
  deckId: uuid('deck_id')
    .references(() => decks.id, { onDelete: 'cascade' })
    .notNull(),
  deckLabelId: uuid('deck_label_id')
    .references(() => deckLabels.id, { onDelete: 'cascade' })
    .notNull(),
});

// ORM Relations
export const deckLabelRelations = relations(deckLabels, ({ many }) => ({
  deckTagsDecks: many(deckLabelsDecks),
}));

export const deckLabelDecksRelations = relations(
  deckLabelsDecks,
  ({ one }) => ({
    tag: one(deckLabels, {
      fields: [deckLabelsDecks.deckLabelId],
      references: [deckLabels.id],
    }),
    deck: one(decks, {
      fields: [deckLabelsDecks.deckId],
      references: [decks.id],
    }),
  }),
);
