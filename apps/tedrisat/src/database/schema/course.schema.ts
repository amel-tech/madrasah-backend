import {
  pgTable as table,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { kosks } from './kosk.schema';
import { CourseLevel } from '../../course/domain/course-level.enum';
import { CourseStatus } from '../../course/domain/course-status.enum';
import { LessonType } from '../../course/domain/lesson-type.enum';
import { EnrollmentStatus } from '../../course/domain/enrollment-status.enum';

// Enums
export const courseLevel = pgEnum('course_level', CourseLevel);
export const courseStatus = pgEnum('course_status', CourseStatus);
export const lessonType = pgEnum('lesson_type', LessonType);
export const enrollmentStatus = pgEnum('enrollment_status', EnrollmentStatus);

// Tables
export const courses = table('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  koskId: uuid('kosk_id')
    .references(() => kosks.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: uuid('author_id').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  category: text('category'),
  level: courseLevel().default(CourseLevel.BEGINNER).notNull(),
  language: text('language'),
  coverHue: integer('cover_hue').default(220).notNull(),
  durationWeeks: integer('duration_weeks').default(0).notNull(),
  status: courseStatus().default(CourseStatus.DRAFT).notNull(),
  grantsCertificate: boolean('grants_certificate').default(false).notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const courseWeeks = table('course_weeks', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  weekNumber: integer('week_number').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lessons = table('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekId: uuid('week_id')
    .references(() => courseWeeks.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  type: lessonType().notNull(),
  duration: text('duration'),
  kaynak: text('kaynak'),
  // Live-session fields (type = LIVE). `withTimezone` because students and
  // müderris may be in different zones; created/updated remain naive for
  // backward compatibility with the original migration.
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  meetingUrl: text('meeting_url'),
  agenda: jsonb('agenda').$type<{ time: string; title: string }[]>(),
  isPreview: boolean('is_preview').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const courseMuderris = table('course_muderris', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id'),
  name: text('name').notNull(),
  title: text('title'),
  bio: text('bio'),
  avatarHue: integer('avatar_hue').default(220).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
});

export const courseResources = table('course_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  meta: text('meta'),
  type: text('type'),
  url: text('url'),
  orderIndex: integer('order_index').default(0).notNull(),
});

export const enrollments = table(
  'enrollments',
  {
    userId: uuid('user_id').notNull(),
    courseId: uuid('course_id')
      .references(() => courses.id, { onDelete: 'cascade' })
      .notNull(),
    studentName: text('student_name'),
    studentEmail: text('student_email'),
    progress: integer('progress').default(0).notNull(),
    status: enrollmentStatus().default(EnrollmentStatus.ENROLLED).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseId] })],
);

// ORM Relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  kosk: one(kosks, {
    fields: [courses.koskId],
    references: [kosks.id],
  }),
  weeks: many(courseWeeks),
  muderris: many(courseMuderris),
  resources: many(courseResources),
  enrollments: many(enrollments),
}));

export const courseWeeksRelations = relations(courseWeeks, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseWeeks.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  week: one(courseWeeks, {
    fields: [lessons.weekId],
    references: [courseWeeks.id],
  }),
}));

export const courseMuderrisRelations = relations(courseMuderris, ({ one }) => ({
  course: one(courses, {
    fields: [courseMuderris.courseId],
    references: [courses.id],
  }),
}));

export const courseResourcesRelations = relations(
  courseResources,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseResources.courseId],
      references: [courses.id],
    }),
  }),
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));
