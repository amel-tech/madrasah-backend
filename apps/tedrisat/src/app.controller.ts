import { Controller, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@madrasah/common/';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CommonErrors, MedarisError, HealthCheckDto } from '@madrasah/common';
import { TedrisatErrors } from './constants/error-codes';

@ApiTags('Tedrisat Service')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get hello message',
    description: 'Returns a greeting message from the Tedrisat service',
  })
  @ApiResponse({
    status: 200,
    description: 'Greeting message',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the Tedrisat service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health information',
    type: HealthCheckDto,
  })
  getHealth(): HealthCheckDto {
    return this.appService.getHealth();
  }

  @Get('tedrisat-error')
  @ApiOperation({ summary: 'Throw a dummy TEDRISAT error' })
  throwTedrisatError(): Promise<void> {
    throw MedarisError.of(
      TedrisatErrors.STUDENT_NOT_FOUND,
      'This is a test error to demonstrate error handling, method throwDummyTedrisatError',
      { studentId: 123 },
    ).withStatus(400); // status code can be overridden
  }

  @Get('common-error')
  @ApiOperation({ summary: 'Throw a dummy COMMON error' })
  throwCommonError(): Promise<void> {
    throw MedarisError.of(
      CommonErrors.VALIDATION_ERROR,
      'This is a test error to demonstrate error handling, method throwDummyCommonError',
    );
  }

  @Get('secure')
  @ApiOperation({
    summary: 'Get secure hello message',
    description: 'Returns a secure hello message from the Tedrisat service',
  })
  @ApiResponse({
    status: 200,
    description: 'Secure hello message',
    type: String,
  })
  @UseGuards(AuthGuard) // Ensure this endpoint is protected by the AuthGuard
  getSecureHello(): string {
    return `Hello this endpoint is secure!`;
  }
}
