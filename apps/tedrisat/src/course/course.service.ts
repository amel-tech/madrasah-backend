import { Injectable } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { KoskService } from '../kosk/kosk.service';
import {
  ICourse,
  ICourseDetail,
  ICourseSummary,
  ICreateCourse,
  IEnrollment,
  IUpdateCourse,
} from './course.repository.interface';
import { CourseNotFoundError } from './errors/course-not-found.error';
import { EnrollmentStatus } from './domain/enrollment-status.enum';

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
    await this.koskService.findById(koskId); // throws if köşk is missing
    return this.courseRepo.findSummariesByKosk(koskId, userId);
  }

  async getDetail(id: string, userId: string): Promise<ICourseDetail> {
    const course = await this.courseRepo.findDetailById(id, userId);
    if (!course) {
      throw new CourseNotFoundError(id);
    }
    return course;
  }

  async create(
    koskId: string,
    authorId: string,
    course: Omit<ICreateCourse, 'koskId' | 'authorId'>,
  ): Promise<ICourseDetail> {
    await this.koskService.findById(koskId); // throws if köşk is missing
    return this.courseRepo.create({ ...course, koskId, authorId });
  }

  async update(id: string, updates: IUpdateCourse): Promise<ICourse> {
    const updated = await this.courseRepo.update(id, updates);
    if (!updated) {
      throw new CourseNotFoundError(id);
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.courseRepo.delete(id);
  }

  async enroll(userId: string, courseId: string): Promise<IEnrollment> {
    await this.getDetail(courseId, userId); // throws if course is missing
    return this.courseRepo.enroll(userId, courseId);
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progress: number,
    status?: EnrollmentStatus,
  ): Promise<IEnrollment> {
    await this.courseRepo.enroll(userId, courseId); // idempotent
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
