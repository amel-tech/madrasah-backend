import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import {
  courseMuderris,
  courseResources,
  courseWeeks,
  courses,
  enrollments,
  lessons,
} from '../database/schema/course.schema';
import {
  ICourse,
  ICourseDetail,
  ICourseRepository,
  ICourseSummary,
  ICreateCourse,
  IEnrollment,
  IReplaceCourse,
  IUpdateCourse,
} from './course.repository.interface';
import { EnrollmentStatus } from './domain/enrollment-status.enum';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findSummariesByKosk(
    koskId: string,
    userId: string,
  ): Promise<ICourseSummary[]> {
    const rows = await this.db.query.courses.findMany({
      where: eq(courses.koskId, koskId),
      with: {
        weeks: { with: { lessons: true } },
        muderris: { orderBy: (m, { asc }) => [asc(m.orderIndex)] },
        resources: true,
        enrollments: { where: (e, { eq }) => eq(e.userId, userId) },
      },
    });

    return rows.map((row) => {
      const { weeks, resources, enrollments: enr, ...course } = row;
      return {
        ...course,
        weekCount: weeks.length,
        lessonCount: weeks.reduce((sum, w) => sum + w.lessons.length, 0),
        resourceCount: resources.length,
        muderris: row.muderris,
        enrollment: enr[0] ?? null,
      };
    });
  }

  async findDetailById(
    id: string,
    userId: string,
  ): Promise<ICourseDetail | null> {
    const row = await this.db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        weeks: {
          orderBy: (w, { asc }) => [asc(w.weekNumber)],
          with: {
            lessons: { orderBy: (l, { asc }) => [asc(l.orderIndex)] },
          },
        },
        muderris: { orderBy: (m, { asc }) => [asc(m.orderIndex)] },
        resources: { orderBy: (r, { asc }) => [asc(r.orderIndex)] },
        enrollments: { where: (e, { eq }) => eq(e.userId, userId) },
      },
    });

    if (!row) return null;
    const { enrollments: enr, ...course } = row;
    return { ...course, enrollment: enr[0] ?? null };
  }

  async create(course: ICreateCourse): Promise<ICourseDetail> {
    const { weeks, muderris, resources, ...courseData } = course;

    const courseId = await this.db.transaction(async (tx) => {
      const [createdCourse] = await tx
        .insert(courses)
        .values(courseData)
        .returning();

      if (muderris?.length) {
        await tx.insert(courseMuderris).values(
          muderris.map((m, i) => ({
            courseId: createdCourse.id,
            userId: m.userId,
            name: m.name,
            title: m.title,
            bio: m.bio,
            avatarHue: m.avatarHue,
            orderIndex: i,
          })),
        );
      }

      if (resources?.length) {
        await tx.insert(courseResources).values(
          resources.map((r, i) => ({
            courseId: createdCourse.id,
            name: r.name,
            meta: r.meta,
            type: r.type,
            url: r.url,
            orderIndex: i,
          })),
        );
      }

      for (const [wi, week] of (weeks ?? []).entries()) {
        const [createdWeek] = await tx
          .insert(courseWeeks)
          .values({
            courseId: createdCourse.id,
            weekNumber: week.weekNumber,
            title: week.title,
            summary: week.summary,
            orderIndex: wi,
          })
          .returning();

        if (week.lessons?.length) {
          await tx.insert(lessons).values(
            week.lessons.map((l, li) => ({
              weekId: createdWeek.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              kaynak: l.kaynak,
              isPreview: l.isPreview ?? false,
              orderIndex: li,
            })),
          );
        }
      }

      return createdCourse.id;
    });

    // authorId is the creator; enrollment is irrelevant at creation time.
    const detail = await this.findDetailById(courseId, course.authorId);
    return detail as ICourseDetail;
  }

  async replace(
    id: string,
    userId: string,
    data: IReplaceCourse,
  ): Promise<ICourseDetail> {
    const { weeks, muderris, resources, ...courseData } = data;

    await this.db.transaction(async (tx) => {
      await tx
        .update(courses)
        .set({ ...courseData, updatedAt: new Date() })
        .where(eq(courses.id, id));

      // Replace nested content: cascading delete then reinsert.
      await tx.delete(courseWeeks).where(eq(courseWeeks.courseId, id));
      await tx.delete(courseMuderris).where(eq(courseMuderris.courseId, id));
      await tx.delete(courseResources).where(eq(courseResources.courseId, id));

      if (muderris?.length) {
        await tx.insert(courseMuderris).values(
          muderris.map((m, i) => ({
            courseId: id,
            userId: m.userId,
            name: m.name,
            title: m.title,
            bio: m.bio,
            avatarHue: m.avatarHue,
            orderIndex: i,
          })),
        );
      }

      if (resources?.length) {
        await tx.insert(courseResources).values(
          resources.map((r, i) => ({
            courseId: id,
            name: r.name,
            meta: r.meta,
            type: r.type,
            url: r.url,
            orderIndex: i,
          })),
        );
      }

      for (const [wi, week] of (weeks ?? []).entries()) {
        const [createdWeek] = await tx
          .insert(courseWeeks)
          .values({
            courseId: id,
            weekNumber: week.weekNumber,
            title: week.title,
            summary: week.summary,
            orderIndex: wi,
          })
          .returning();

        if (week.lessons?.length) {
          await tx.insert(lessons).values(
            week.lessons.map((l, li) => ({
              weekId: createdWeek.id,
              title: l.title,
              type: l.type,
              duration: l.duration,
              kaynak: l.kaynak,
              isPreview: l.isPreview ?? false,
              orderIndex: li,
            })),
          );
        }
      }
    });

    return (await this.findDetailById(id, userId)) as ICourseDetail;
  }

  async update(id: string, updates: IUpdateCourse): Promise<ICourse | null> {
    return this.db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning()
      .then((result) => result[0] || null);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return deleted.length > 0;
  }

  async enroll(userId: string, courseId: string): Promise<IEnrollment> {
    const [enrollment] = await this.db
      .insert(enrollments)
      .values({ userId, courseId })
      .onConflictDoNothing()
      .returning();

    if (enrollment) return enrollment;

    // Already enrolled — return the existing row.
    return (await this.findEnrollment(userId, courseId)) as IEnrollment;
  }

  async findEnrollment(
    userId: string,
    courseId: string,
  ): Promise<IEnrollment | null> {
    return this.db
      .select()
      .from(enrollments)
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      )
      .limit(1)
      .then((result) => result[0] || null);
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progress: number,
    status: EnrollmentStatus,
  ): Promise<IEnrollment | null> {
    return this.db
      .update(enrollments)
      .set({ progress, status, updatedAt: new Date() })
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      )
      .returning()
      .then((result) => result[0] || null);
  }
}
