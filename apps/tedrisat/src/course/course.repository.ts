import { Injectable } from '@nestjs/common';
import { and, eq, inArray, ne } from 'drizzle-orm';
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
  IEnrolledCourse,
  IEnrollment,
  IEnrollOptions,
  IPendingEnrollment,
  IReplaceCourse,
  IUpdateCourse,
} from './course.repository.interface';
import { CourseStatus } from './domain/course-status.enum';
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
    includeDrafts: boolean,
  ): Promise<ICourseSummary[]> {
    const rows = await this.db.query.courses.findMany({
      // DRAFT courses are only visible to the köşk owner.
      where: includeDrafts
        ? eq(courses.koskId, koskId)
        : and(
            eq(courses.koskId, koskId),
            eq(courses.status, CourseStatus.PUBLISHED),
          ),
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

  async findEnrolledByUser(userId: string): Promise<IEnrolledCourse[]> {
    const rows = await this.db.query.enrollments.findMany({
      where: and(
        eq(enrollments.userId, userId),
        ne(enrollments.status, EnrollmentStatus.PENDING),
      ),
      with: {
        course: {
          with: {
            kosk: { columns: { name: true } },
            weeks: { with: { lessons: { columns: { id: true } } } },
            muderris: { orderBy: (m, { asc }) => [asc(m.orderIndex)] },
          },
        },
      },
    });

    return rows.map((row) => {
      const { kosk, weeks, muderris, ...course } = row.course;
      return {
        ...course,
        koskName: kosk.name,
        weekCount: weeks.length,
        lessonCount: weeks.reduce((sum, w) => sum + w.lessons.length, 0),
        muderris,
        enrollment: {
          userId: row.userId,
          courseId: row.courseId,
          studentName: row.studentName,
          studentEmail: row.studentEmail,
          progress: row.progress,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
      };
    });
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
              scheduledAt: l.scheduledAt,
              meetingUrl: l.meetingUrl,
              agenda: l.agenda,
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
    const { weeks = [], muderris = [], resources = [], ...courseData } = data;

    await this.db.transaction(async (tx) => {
      await tx
        .update(courses)
        .set({ ...courseData, updatedAt: new Date() })
        .where(eq(courses.id, id));

      // ---- müderris: upsert by id, delete the rest ----
      const existingMuderris = await tx
        .select({ id: courseMuderris.id })
        .from(courseMuderris)
        .where(eq(courseMuderris.courseId, id));
      const muderrisKeep = new Set(
        muderris.map((m) => m.id).filter((x): x is string => Boolean(x)),
      );
      const muderrisToDelete = existingMuderris
        .filter((e) => !muderrisKeep.has(e.id))
        .map((e) => e.id);
      if (muderrisToDelete.length) {
        await tx
          .delete(courseMuderris)
          .where(inArray(courseMuderris.id, muderrisToDelete));
      }
      const existingMuderrisIds = new Set(existingMuderris.map((e) => e.id));
      for (const [i, m] of muderris.entries()) {
        const values = {
          courseId: id,
          userId: m.userId,
          name: m.name,
          title: m.title,
          bio: m.bio,
          avatarHue: m.avatarHue,
          orderIndex: i,
        };
        if (m.id && existingMuderrisIds.has(m.id)) {
          await tx
            .update(courseMuderris)
            .set(values)
            .where(eq(courseMuderris.id, m.id));
        } else {
          await tx.insert(courseMuderris).values(values);
        }
      }

      // ---- resources: upsert by id, delete the rest ----
      const existingResources = await tx
        .select({ id: courseResources.id })
        .from(courseResources)
        .where(eq(courseResources.courseId, id));
      const resourcesKeep = new Set(
        resources.map((r) => r.id).filter((x): x is string => Boolean(x)),
      );
      const resourcesToDelete = existingResources
        .filter((e) => !resourcesKeep.has(e.id))
        .map((e) => e.id);
      if (resourcesToDelete.length) {
        await tx
          .delete(courseResources)
          .where(inArray(courseResources.id, resourcesToDelete));
      }
      const existingResourceIds = new Set(existingResources.map((e) => e.id));
      for (const [i, r] of resources.entries()) {
        const values = {
          courseId: id,
          name: r.name,
          meta: r.meta,
          type: r.type,
          url: r.url,
          orderIndex: i,
        };
        if (r.id && existingResourceIds.has(r.id)) {
          await tx
            .update(courseResources)
            .set(values)
            .where(eq(courseResources.id, r.id));
        } else {
          await tx.insert(courseResources).values(values);
        }
      }

      // ---- weeks + lessons: upsert by id, delete the rest ----
      const existingWeeks = await tx
        .select({ id: courseWeeks.id })
        .from(courseWeeks)
        .where(eq(courseWeeks.courseId, id));
      const existingWeekIds = new Set(existingWeeks.map((w) => w.id));
      const weeksKeep = new Set(
        weeks
          .map((w) => w.id)
          .filter((x): x is string => Boolean(x) && existingWeekIds.has(x!)),
      );
      const weeksToDelete = existingWeeks
        .filter((w) => !weeksKeep.has(w.id))
        .map((w) => w.id);
      if (weeksToDelete.length) {
        // cascades to the deleted weeks' lessons
        await tx
          .delete(courseWeeks)
          .where(inArray(courseWeeks.id, weeksToDelete));
      }

      for (const [wi, week] of weeks.entries()) {
        const weekValues = {
          courseId: id,
          weekNumber: week.weekNumber,
          title: week.title,
          summary: week.summary,
          orderIndex: wi,
        };

        let weekId: string;
        if (week.id && existingWeekIds.has(week.id)) {
          await tx
            .update(courseWeeks)
            .set(weekValues)
            .where(eq(courseWeeks.id, week.id));
          weekId = week.id;

          const existingLessons = await tx
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.weekId, weekId));
          const existingLessonIds = new Set(existingLessons.map((l) => l.id));
          const lessonsKeep = new Set(
            (week.lessons ?? [])
              .map((l) => l.id)
              .filter(
                (x): x is string => Boolean(x) && existingLessonIds.has(x!),
              ),
          );
          const lessonsToDelete = existingLessons
            .filter((l) => !lessonsKeep.has(l.id))
            .map((l) => l.id);
          if (lessonsToDelete.length) {
            await tx
              .delete(lessons)
              .where(inArray(lessons.id, lessonsToDelete));
          }
          for (const [li, l] of (week.lessons ?? []).entries()) {
            const lessonValues = {
              weekId,
              title: l.title,
              type: l.type,
              duration: l.duration,
              kaynak: l.kaynak,
              scheduledAt: l.scheduledAt,
              meetingUrl: l.meetingUrl,
              agenda: l.agenda,
              isPreview: l.isPreview ?? false,
              orderIndex: li,
            };
            if (l.id && existingLessonIds.has(l.id)) {
              await tx
                .update(lessons)
                .set(lessonValues)
                .where(eq(lessons.id, l.id));
            } else {
              await tx.insert(lessons).values(lessonValues);
            }
          }
        } else {
          const [createdWeek] = await tx
            .insert(courseWeeks)
            .values(weekValues)
            .returning();
          weekId = createdWeek.id;
          if (week.lessons?.length) {
            await tx.insert(lessons).values(
              week.lessons.map((l, li) => ({
                weekId,
                title: l.title,
                type: l.type,
                duration: l.duration,
                kaynak: l.kaynak,
                scheduledAt: l.scheduledAt,
                meetingUrl: l.meetingUrl,
                agenda: l.agenda,
                isPreview: l.isPreview ?? false,
                orderIndex: li,
              })),
            );
          }
        }
      }
    });

    return (await this.findDetailById(id, userId)) as ICourseDetail;
  }

  async findKoskId(id: string): Promise<string | null> {
    const rows = await this.db
      .select({ koskId: courses.koskId })
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return rows[0]?.koskId ?? null;
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

  async enroll(
    userId: string,
    courseId: string,
    options: IEnrollOptions = {},
  ): Promise<IEnrollment> {
    const [enrollment] = await this.db
      .insert(enrollments)
      .values({
        userId,
        courseId,
        status: options.status,
        studentName: options.studentName,
        studentEmail: options.studentEmail,
      })
      .onConflictDoNothing()
      .returning();

    if (enrollment) return enrollment;

    // Already enrolled — return the existing row.
    return (await this.findEnrollment(userId, courseId)) as IEnrollment;
  }

  async findPendingByKosk(koskId: string): Promise<IPendingEnrollment[]> {
    const rows = await this.db
      .select({
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        studentName: enrollments.studentName,
        studentEmail: enrollments.studentEmail,
        progress: enrollments.progress,
        status: enrollments.status,
        createdAt: enrollments.createdAt,
        updatedAt: enrollments.updatedAt,
        courseTitle: courses.title,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          eq(courses.koskId, koskId),
          eq(enrollments.status, EnrollmentStatus.PENDING),
        ),
      )
      .orderBy(enrollments.createdAt);
    return rows;
  }

  async setEnrollmentStatus(
    userId: string,
    courseId: string,
    status: EnrollmentStatus,
  ): Promise<IEnrollment | null> {
    return this.db
      .update(enrollments)
      .set({ status, updatedAt: new Date() })
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      )
      .returning()
      .then((result) => result[0] || null);
  }

  async deleteEnrollment(userId: string, courseId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(enrollments)
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      )
      .returning();
    return deleted.length > 0;
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
