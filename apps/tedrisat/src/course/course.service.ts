import { Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { KoskService } from '../kosk/kosk.service';
import {
  ICourse,
  ICourseDetail,
  ICourseSummary,
  ICreateCourse,
  ICreateMuderris,
  IEnrolledCourse,
  IEnrollment,
  IMuderris,
  IPendingEnrollment,
  IReplaceCourse,
  IUpdateCourse,
} from './course.repository.interface';
import { CourseNotFoundError } from './errors/course-not-found.error';
import { EnrollmentNotFoundError } from './errors/enrollment-not-found.error';
import { EnrollmentStatus } from './domain/enrollment-status.enum';

export interface StudentIdentity {
  name?: string | null;
  email?: string | null;
}

/**
 * Course CRUD. Authorization is enforced upstream by `@Authz` on the
 * controller: EDIT / DELETE / MANAGE_ENROLLMENTS reach this service only
 * when the caller is KOSK_MANAGER or MUDERRIS (per matrix.course).
 * Self-bounded paths (enroll, updateProgress, findEnrolled) take the
 * caller's userId explicitly because the operation is keyed by it.
 *
 * `assertCourseOwner` is preserved as a cross-module helper for callers
 * outside the HTTP path.
 */
@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly koskService: KoskService,
  ) {}

  async findSummariesByKosk(
    koskId: string,
    userId: string,
  ): Promise<ICourseSummary[]> {
    await this.koskService.findById(koskId, userId); // throws if köşk is missing
    return this.courseRepo.findSummariesByKosk(koskId, userId);
  }

  async findEnrolledCourses(userId: string): Promise<IEnrolledCourse[]> {
    return this.courseRepo.findEnrolledByUser(userId);
  }

  async getDetail(id: string, userId: string): Promise<ICourseDetail> {
    const course = await this.courseRepo.findDetailById(id, userId);
    if (!course) {
      throw new CourseNotFoundError(id);
    }
    return course;
  }

  /** Cross-module helper: ensures the course exists and its parent
   *  köşk is owned by `userId`. */
  async assertCourseOwner(courseId: string, userId: string): Promise<void> {
    const koskId = await this.courseRepo.findKoskId(courseId);
    if (koskId === null) {
      throw new CourseNotFoundError(courseId);
    }
    await this.koskService.assertOwner(koskId, userId);
  }

  async create(
    koskId: string,
    authorId: string,
    course: Omit<ICreateCourse, 'koskId' | 'authorId'>,
  ): Promise<ICourseDetail> {
    // Existence check on the parent köşk surfaces a clean 404 when the
    // ID is missing — authz already gated ownership; this avoids a raw
    // FK violation for SYSTEM_ADMIN callers (who bypass the matrix).
    await this.koskService.findById(koskId, authorId);
    return this.courseRepo.create({ ...course, koskId, authorId });
  }

  async update(id: string, updates: IUpdateCourse): Promise<ICourse> {
    const updated = await this.courseRepo.update(id, updates);
    if (!updated) {
      throw new CourseNotFoundError(id);
    }
    return updated;
  }

  async replace(
    id: string,
    userId: string,
    data: IReplaceCourse,
  ): Promise<ICourseDetail> {
    // `userId` is forwarded as the syllabus author when the repository
    // rewrites course_weeks/lessons/etc. — not for authorization.
    // Existence check first so a missing UUID surfaces as 404 (matrix
    // already gated ownership for non-admin callers).
    const exists = await this.courseRepo.findKoskId(id);
    if (exists === null) throw new CourseNotFoundError(id);
    return this.courseRepo.replace(id, userId, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.courseRepo.delete(id);
  }

  async enroll(
    userId: string,
    courseId: string,
    student: StudentIdentity = {},
  ): Promise<IEnrollment> {
    const course = await this.getDetail(courseId, userId); // throws if missing
    const status = course.requiresApproval
      ? EnrollmentStatus.PENDING
      : EnrollmentStatus.ENROLLED;
    return this.courseRepo.enroll(userId, courseId, {
      status,
      studentName: student.name ?? null,
      studentEmail: student.email ?? null,
    });
  }

  async findPendingEnrollments(
    koskId: string,
    userId: string,
  ): Promise<IPendingEnrollment[]> {
    // The @Authz on the controller already verified the caller manages
    // this köşk; reading köşk existence here would only narrow a 403 to
    // 404 — for now we trust the matrix and let the repository handle
    // empty results naturally. `userId` is kept for future repo filters.
    void userId;
    return this.courseRepo.findPendingByKosk(koskId);
  }

  async approveEnrollment(
    courseId: string,
    studentId: string,
  ): Promise<IEnrollment> {
    const updated = await this.courseRepo.setEnrollmentStatus(
      studentId,
      courseId,
      EnrollmentStatus.ENROLLED,
    );
    if (!updated) {
      throw new EnrollmentNotFoundError(courseId);
    }
    return updated;
  }

  async rejectEnrollment(
    courseId: string,
    studentId: string,
  ): Promise<boolean> {
    // Only pending requests can be rejected; deleting an active or completed
    // enrollment must go through a deliberate unenroll flow, not "reject".
    const existing = await this.courseRepo.findEnrollment(studentId, courseId);
    if (!existing || existing.status !== EnrollmentStatus.PENDING) {
      throw new EnrollmentNotFoundError(courseId);
    }
    return this.courseRepo.deleteEnrollment(studentId, courseId);
  }

  async assignMuderris(
    courseId: string,
    muderris: ICreateMuderris,
  ): Promise<IMuderris> {
    const koskId = await this.courseRepo.findKoskId(courseId);
    if (koskId === null) {
      throw new CourseNotFoundError(courseId);
    }
    return this.courseRepo.assignMuderris(courseId, muderris);
  }

  async removeMuderris(courseId: string, muderrisId: string): Promise<boolean> {
    return this.courseRepo.removeMuderris(courseId, muderrisId);
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progress: number,
    status?: EnrollmentStatus,
  ): Promise<IEnrollment> {
    // Progress can only be recorded against an active enrollment. A pending
    // (awaiting-approval) or missing enrollment must not be silently promoted,
    // otherwise this endpoint would bypass the köşk owner's approval.
    const existing = await this.courseRepo.findEnrollment(userId, courseId);
    if (!existing || existing.status === EnrollmentStatus.PENDING) {
      throw new EnrollmentNotFoundError(courseId);
    }
    const resolvedStatus =
      status ??
      (progress >= 100
        ? EnrollmentStatus.COMPLETED
        : EnrollmentStatus.ENROLLED);
    const updated = await this.courseRepo.updateProgress(
      userId,
      courseId,
      progress,
      resolvedStatus,
    );
    return updated as IEnrollment;
  }
}
