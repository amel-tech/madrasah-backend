import { Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { KoskService } from '../kosk/kosk.service';
import {
  ICourse,
  ICourseDetail,
  ICourseSummary,
  ICreateCourse,
  IEnrolledCourse,
  IEnrollment,
  IPendingEnrollment,
  IReplaceCourse,
  IUpdateCourse,
} from './course.repository.interface';
import { CourseNotFoundError } from './errors/course-not-found.error';
import { EnrollmentNotFoundError } from './errors/enrollment-not-found.error';
import { CourseStatus } from './domain/course-status.enum';
import { EnrollmentStatus } from './domain/enrollment-status.enum';

export interface StudentIdentity {
  name?: string | null;
  email?: string | null;
}

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
    const kosk = await this.koskService.findById(koskId, userId); // throws if köşk is missing
    // Only the köşk owner sees DRAFT courses; everyone else gets PUBLISHED only.
    const includeDrafts = kosk.ownerId === userId;
    return this.courseRepo.findSummariesByKosk(koskId, userId, includeDrafts);
  }

  async findEnrolledCourses(userId: string): Promise<IEnrolledCourse[]> {
    return this.courseRepo.findEnrolledByUser(userId);
  }

  async getDetail(id: string, userId: string): Promise<ICourseDetail> {
    const course = await this.courseRepo.findDetailById(id, userId);
    if (!course) {
      throw new CourseNotFoundError(id);
    }
    // A DRAFT course is invisible to anyone but its köşk owner — surface it as
    // not-found rather than forbidden so its existence isn't leaked.
    if (course.status === CourseStatus.DRAFT) {
      const isOwner = await this.koskService.isOwner(course.koskId, userId);
      if (!isOwner) {
        throw new CourseNotFoundError(id);
      }
    }
    return course;
  }

  /** Ensures the course exists and its köşk is owned by `userId`, else throws. */
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
    await this.koskService.assertOwner(koskId, authorId); // köşk owner only
    return this.courseRepo.create({ ...course, koskId, authorId });
  }

  async update(
    id: string,
    userId: string,
    updates: IUpdateCourse,
  ): Promise<ICourse> {
    await this.assertCourseOwner(id, userId);
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
    await this.assertCourseOwner(id, userId);
    return this.courseRepo.replace(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.assertCourseOwner(id, userId);
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
    await this.koskService.assertOwner(koskId, userId); // köşk owner only
    return this.courseRepo.findPendingByKosk(koskId);
  }

  async approveEnrollment(
    courseId: string,
    ownerId: string,
    studentId: string,
  ): Promise<IEnrollment> {
    await this.assertCourseOwner(courseId, ownerId);
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
    ownerId: string,
    studentId: string,
  ): Promise<boolean> {
    await this.assertCourseOwner(courseId, ownerId);
    // Only pending requests can be rejected; deleting an active or completed
    // enrollment must go through a deliberate unenroll flow, not "reject".
    const existing = await this.courseRepo.findEnrollment(studentId, courseId);
    if (!existing || existing.status !== EnrollmentStatus.PENDING) {
      throw new EnrollmentNotFoundError(courseId);
    }
    return this.courseRepo.deleteEnrollment(studentId, courseId);
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
