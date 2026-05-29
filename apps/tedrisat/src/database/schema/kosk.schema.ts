import {
  pgTable as table,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './course.schema';

// Köşk = publisher / school that owns courses.
export const kosks = table('kosks', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: text('name').notNull(),
  handle: text('handle'),
  description: text('description'),
  coverHue: integer('cover_hue').default(215).notNull(),
  isPrivate: boolean('is_private').default(true).notNull(),
  // Discovery metadata (surfaced on the köşk list / detail).
  field: text('field'), // ilim alanı, e.g. "Tefsir & Hadis"
  level: text('level'), // 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  tags: text('tags').array().default([]).notNull(),
  verified: boolean('verified').default(false).notNull(),
  featured: boolean('featured').default(false).notNull(),
  rating: real('rating').default(0).notNull(),
  ratingCount: integer('rating_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Talebe ↔ köşk follow relationship.
export const koskFollowers = table(
  'kosk_followers',
  {
    userId: uuid('user_id').notNull(),
    koskId: uuid('kosk_id')
      .references(() => kosks.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.koskId] })],
);

export const kosksRelations = relations(kosks, ({ many }) => ({
  courses: many(courses),
  followers: many(koskFollowers),
}));

export const koskFollowersRelations = relations(koskFollowers, ({ one }) => ({
  kosk: one(kosks, {
    fields: [koskFollowers.koskId],
    references: [kosks.id],
  }),
}));
