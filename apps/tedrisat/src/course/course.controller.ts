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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@madrasah/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  CourseDetailResponse,
  CourseSummaryResponse,
  EnrollmentResponse,
} from './dto/course-response.dto';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiOperation({
    summary: 'List the courses that belong to a köşk',
    operationId: 'getCoursesByKosk',
  })
  @ApiOkResponse({ type: CourseSummaryResponse, isArray: true })
  @ApiNotFoundResponse()
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
    summary: 'Get a course with its full syllabus, müderris and resources',
    operationId: 'getCourseById',
  })
  @ApiOkResponse({ type: CourseDetailResponse })
  @ApiNotFoundResponse()
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
  @Post('courses/:id/enroll')
  async enroll(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnrollmentResponse> {
    return this.courseService.enroll(request.user.sub, id);
  }

  @ApiOperation({
    summary: "Update the current talebe's progress in a course",
    operationId: 'updateCourseProgress',
  })
  @ApiOkResponse({ type: EnrollmentResponse })
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
