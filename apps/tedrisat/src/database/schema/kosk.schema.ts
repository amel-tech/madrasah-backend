import {
  pgTable as table,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const kosksRelations = relations(kosks, ({ many }) => ({
  courses: many(courses),
}));
