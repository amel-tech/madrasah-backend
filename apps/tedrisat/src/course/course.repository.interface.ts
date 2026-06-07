import { CourseLevel } from './domain/course-level.enum';
import { CourseStatus } from './domain/course-status.enum';
import { EnrollmentStatus } from './domain/enrollment-status.enum';
import { LessonType } from './domain/lesson-type.enum';

export interface ILesson {
  id: string;
  weekId: string;
  title: string;
  type: LessonType;
  duration: string | null;
  kaynak: string | null;
  isPreview: boolean;
  orderIndex: number;
}

export interface IWeek {
  id: string;
  courseId: string;
  weekNumber: number;
  title: string;
  summary: string | null;
  orderIndex: number;
  lessons: ILesson[];
}

export interface IMuderris {
  id: string;
  courseId: string;
  userId: string | null;
  name: string;
  title: string | null;
  bio: string | null;
  avatarHue: number;
  orderIndex: number;
}

export interface IResource {
  id: string;
  courseId: string;
  name: string;
  meta: string | null;
  type: string | null;
  url: string | null;
  orderIndex: number;
}

export interface ICourse {
  id: string;
  koskId: string;
  authorId: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  level: CourseLevel;
  language: string | null;
  coverHue: number;
  durationWeeks: number;
  status: CourseStatus;
  grantsCertificate: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseDetail extends ICourse {
  weeks: IWeek[];
  muderris: IMuderris[];
  resources: IResource[];
  enrollment: IEnrollment | null;
}

export interface ICourseSummary extends ICourse {
  weekCount: number;
  lessonCount: number;
  resourceCount: number;
  muderris: IMuderris[];
  enrollment: IEnrollment | null;
}

export interface IEnrolledCourse extends ICourse {
  koskName: string;
  weekCount: number;
  lessonCount: number;
  muderris: IMuderris[];
  enrollment: IEnrollment;
}

export interface IEnrollment {
  userId: string;
  courseId: string;
  studentName: string | null;
  studentEmail: string | null;
  progress: number;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPendingEnrollment extends IEnrollment {
  courseTitle: string;
}

export interface IEnrollOptions {
  status?: EnrollmentStatus;
  studentName?: string | null;
  studentEmail?: string | null;
}

export interface ICreateLesson {
  id?: string;
  title: string;
  type: LessonType;
  duration?: string;
  kaynak?: string;
  isPreview?: boolean;
}

export interface ICreateWeek {
  id?: string;
  weekNumber: number;
  title: string;
  summary?: string;
  lessons: ICreateLesson[];
}

export interface ICreateMuderris {
  id?: string;
  userId?: string;
  name: string;
  title?: string;
  bio?: string;
  avatarHue?: number;
}

export interface ICreateResource {
  id?: string;
  name: string;
  meta?: string;
  type?: string;
  url?: string;
}

export interface ICreateCourse {
  koskId: string;
  authorId: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
  language?: string;
  coverHue?: number;
  durationWeeks?: number;
  status?: CourseStatus;
  grantsCertificate?: boolean;
  requiresApproval?: boolean;
  weeks?: ICreateWeek[];
  muderris?: ICreateMuderris[];
  resources?: ICreateResource[];
}

export interface IUpdateCourse {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
  language?: string;
  coverHue?: number;
  durationWeeks?: number;
  status?: CourseStatus;
  grantsCertificate?: boolean;
  requiresApproval?: boolean;
}

export type IReplaceCourse = Omit<ICreateCourse, 'koskId' | 'authorId'>;

export interface ICourseRepository {
  findSummariesByKosk(
    koskId: string,
    userId: string,
  ): Promise<ICourseSummary[]>;
  findDetailById(id: string, userId: string): Promise<ICourseDetail | null>;
  findEnrolledByUser(userId: string): Promise<IEnrolledCourse[]>;
  create(course: ICreateCourse): Promise<ICourseDetail>;
  findKoskId(id: string): Promise<string | null>;
  update(id: string, updates: IUpdateCourse): Promise<ICourse | null>;
  replace(
    id: string,
    userId: string,
    data: IReplaceCourse,
  ): Promise<ICourseDetail>;
  delete(id: string): Promise<boolean>;
  enroll(
    userId: string,
    courseId: string,
    options?: IEnrollOptions,
  ): Promise<IEnrollment>;
  findEnrollment(userId: string, courseId: string): Promise<IEnrollment | null>;
  findPendingByKosk(koskId: string): Promise<IPendingEnrollment[]>;
  setEnrollmentStatus(
    userId: string,
    courseId: string,
    status: EnrollmentStatus,
  ): Promise<IEnrollment | null>;
  deleteEnrollment(userId: string, courseId: string): Promise<boolean>;
  updateProgress(
    userId: string,
    courseId: string,
    progress: number,
    status: EnrollmentStatus,
  ): Promise<IEnrollment | null>;
}
