import { Controller, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthGuard, HealthCheckDto, ValidationError } from '@madrasah/common';

@ApiTags('Tedrisat Service')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get hello message',
    description: 'Returns a greeting message from the Tedrisat service',
    operationId: 'getHello',
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
    operationId: 'getHealth',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health information',
    type: HealthCheckDto,
  })
  getHealth(): HealthCheckDto {
    return this.appService.getHealth();
  }

  @Get('throw-error')
  @ApiOperation({
    summary: 'Throw a dummy error',
    description:
      'Test endpoint that throws a validation error for demonstration purposes',
    operationId: 'throwTestError',
  })
  throwError(): Promise<void> {
    throw new ValidationError(
      'This is a test error to demonstrate error handling',
      { testCtx: 'testCtx' },
    );
  }

  @Get('secure')
  @ApiOperation({
    summary: 'Get secure hello message',
    description: 'Returns a secure hello message from the Tedrisat service',
    operationId: 'getSecureHello',
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
