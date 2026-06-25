import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { MedarisValidationPipe } from '@madrasah/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthGuard,
  Authz,
  AuthzGuard,
  byParam,
  ENTITIES,
  SCOPES,
} from '@madrasah/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { AssignMuderrisDto } from './dto/assign-muderris.dto';
import {
  CourseDetailResponse,
  CourseSummaryResponse,
  EnrolledCourseResponse,
  EnrollmentResponse,
  PendingEnrollmentResponse,
} from './dto/course-response.dto';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(AuthGuard, AuthzGuard)
@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiOperation({
    summary: 'List the courses that belong to a köşk',
    operationId: 'getCoursesByKosk',
  })
  @ApiOkResponse({ type: CourseSummaryResponse, isArray: true })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  // Anyone who can view the köşk can see its course summaries.
  @Authz(SCOPES.VIEW, byParam(ENTITIES.KOSK, 'koskId'))
  @Get('kosks/:koskId/courses')
  async findByKosk(
    @Req() request: AuthorizedRequest,
    @Param('koskId', ParseUUIDPipe) koskId: string,
  ): Promise<CourseSummaryResponse[]> {
    return this.courseService.findSummariesByKosk(koskId, request.user.sub);
  }

  @ApiOperation({
    summary: 'Create a new course under a köşk',
    operationId: 'createCourse',
  })
  @ApiCreatedResponse({ type: CourseDetailResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  // Creating a course is authorized against the parent köşk —
  // matrix.kosk.MANAGE_COURSES is granted to KOSK_MANAGER and MADRASAH_NAZIR.
  @Authz(SCOPES.MANAGE_COURSES, byParam(ENTITIES.KOSK, 'koskId'))
  @Post('kosks/:koskId/courses')
  @UsePipes(new MedarisValidationPipe({ transform: true }))
  async create(
    @Req() request: AuthorizedRequest,
    @Param('koskId', ParseUUIDPipe) koskId: string,
    @Body() courseDto: CreateCourseDto,
  ): Promise<CourseDetailResponse> {
    return this.courseService.create(koskId, request.user.sub, courseDto);
  }

  @ApiOperation({
    summary: 'List the courses the current talebe is enrolled in',
    operationId: 'getEnrolledCourses',
  })
  @ApiOkResponse({ type: EnrolledCourseResponse, isArray: true })
  // Self-bounded: returns the caller's own enrollments.
  @Get('courses/enrolled')
  async findEnrolled(
    @Req() request: AuthorizedRequest,
  ): Promise<EnrolledCourseResponse[]> {
    return this.courseService.findEnrolledCourses(request.user.sub);
  }

  @ApiOperation({
    summary: 'Get a course with its full syllabus, müderris and resources',
    operationId: 'getCourseById',
  })
  @ApiOkResponse({ type: CourseDetailResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.VIEW, byParam(ENTITIES.COURSE))
  @Get('courses/:id')
  async findById(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourseDetailResponse> {
    return this.courseService.getDetail(id, request.user.sub);
  }

  @ApiOperation({
    summary: 'Update a course',
    operationId: 'updateCourse',
  })
  @ApiOkResponse({ type: CourseDetailResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.EDIT, byParam(ENTITIES.COURSE))
  @Patch('courses/:id')
  async update(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() courseDto: UpdateCourseDto,
  ): Promise<CourseDetailResponse> {
    await this.courseService.update(id, courseDto);
    return this.courseService.getDetail(id, request.user.sub);
  }

  @ApiOperation({
    summary:
      'Replace a course, including its full syllabus, müderris and resources',
    operationId: 'replaceCourse',
  })
  @ApiOkResponse({ type: CourseDetailResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.EDIT, byParam(ENTITIES.COURSE))
  @Put('courses/:id')
  @UsePipes(new MedarisValidationPipe({ transform: true }))
  async replace(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() courseDto: CreateCourseDto,
  ): Promise<CourseDetailResponse> {
    return this.courseService.replace(id, request.user.sub, courseDto);
  }

  @ApiOperation({
    summary: 'Delete a course',
    operationId: 'deleteCourse',
  })
  @ApiOkResponse({ type: Boolean })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.DELETE, byParam(ENTITIES.COURSE))
  @Delete('courses/:id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.courseService.delete(id);
  }

  @ApiOperation({
    summary: 'Enroll the current talebe in a course',
    operationId: 'enrollInCourse',
  })
  @ApiCreatedResponse({ type: EnrollmentResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  // matrix.course.ENROLL is granted to PUBLIC — any authenticated caller
  // may request enrollment in any course that exists.
  @Authz(SCOPES.ENROLL, byParam(ENTITIES.COURSE))
  @Post('courses/:id/enroll')
  async enroll(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnrollmentResponse> {
    const { user } = request;
    const name =
      user.name ??
      [user.given_name, user.family_name].filter(Boolean).join(' ').trim() ??
      user.preferred_username;
    return this.courseService.enroll(user.sub, id, {
      name: name || user.preferred_username || null,
      email: user.email ?? null,
    });
  }

  @ApiOperation({
    summary: 'List pending enrollment requests for a köşk (owner only)',
    operationId: 'getPendingEnrollments',
  })
  @ApiOkResponse({ type: PendingEnrollmentResponse, isArray: true })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  // matrix.kosk.MANAGE_COURSES is granted to KOSK_MANAGER + MADRASAH_NAZIR;
  // listing pending requests across the köşk's courses is part of that.
  @Authz(SCOPES.MANAGE_COURSES, byParam(ENTITIES.KOSK, 'koskId'))
  @Get('kosks/:koskId/enrollments/pending')
  async pendingEnrollments(
    @Req() request: AuthorizedRequest,
    @Param('koskId', ParseUUIDPipe) koskId: string,
  ): Promise<PendingEnrollmentResponse[]> {
    return this.courseService.findPendingEnrollments(koskId, request.user.sub);
  }

  @ApiOperation({
    summary: 'Approve a pending enrollment (köşk owner only)',
    operationId: 'approveEnrollment',
  })
  @ApiOkResponse({ type: EnrollmentResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_ENROLLMENTS, byParam(ENTITIES.COURSE, 'id'))
  @Post('courses/:id/enrollments/:userId/approve')
  async approveEnrollment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<EnrollmentResponse> {
    return this.courseService.approveEnrollment(id, userId);
  }

  @ApiOperation({
    summary: 'Reject a pending enrollment, deleting it (köşk owner only)',
    operationId: 'rejectEnrollment',
  })
  @ApiOkResponse({ type: Boolean })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_ENROLLMENTS, byParam(ENTITIES.COURSE, 'id'))
  @Delete('courses/:id/enrollments/:userId')
  async rejectEnrollment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<boolean> {
    return this.courseService.rejectEnrollment(id, userId);
  }

  @ApiOperation({
    summary: 'Assign a müderris to a course',
    description:
      'KOSK_MANAGER of the parent köşk may assign a müderris. Pass `userId` so the authz layer can grant MUDERRIS to that person on this course.',
    operationId: 'assignMuderris',
  })
  @ApiCreatedResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.ASSIGN_MUDERRIS, byParam(ENTITIES.COURSE, 'id'))
  @Post('courses/:id/muderris')
  async assignMuderris(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignMuderrisDto,
  ) {
    return this.courseService.assignMuderris(id, dto);
  }

  @ApiOperation({
    summary: 'Remove a müderris from a course',
    operationId: 'removeMuderris',
  })
  @ApiOkResponse({ type: Boolean })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.ASSIGN_MUDERRIS, byParam(ENTITIES.COURSE, 'id'))
  @Delete('courses/:id/muderris/:muderrisId')
  async removeMuderris(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('muderrisId', ParseUUIDPipe) muderrisId: string,
  ): Promise<boolean> {
    return this.courseService.removeMuderris(id, muderrisId);
  }

  @ApiOperation({
    summary: "Update the current talebe's progress in a course",
    operationId: 'updateCourseProgress',
  })
  @ApiOkResponse({ type: EnrollmentResponse })
  // Self-bounded: the caller updates their own (userId, courseId) row.
  // Service rejects unless an ENROLLED enrollment exists.
  @Put('courses/:id/progress')
  async updateProgress(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<EnrollmentResponse> {
    return this.courseService.updateProgress(
      request.user.sub,
      id,
      dto.progress,
      dto.status,
    );
  }
}
