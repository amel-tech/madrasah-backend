import {
  pgTable as table,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { decks } from './flashcard-deck.schema';

// Tables
export const deckTags = table('deck_tags', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const deckTagsDecks = table('deck_tags_decks', {
  deckId: integer('deck_id')
    .references(() => decks.id, { onDelete: 'cascade' })
    .notNull(),
  deckTagId: integer('deck_tag_id')
    .references(() => deckTags.id, { onDelete: 'cascade' })
    .notNull(),
});

// ORM Relations
export const deckTagsRelations = relations(deckTags, ({ many }) => ({
  deckTagsDecks: many(deckTagsDecks),
}));

export const deckTagsDecksRelations = relations(deckTagsDecks, ({ one }) => ({
  tag: one(deckTags, {
    fields: [deckTagsDecks.deckTagId],
    references: [deckTags.id],
  }),
  deck: one(decks, {
    fields: [deckTagsDecks.deckId],
    references: [decks.id],
  }),
}));
