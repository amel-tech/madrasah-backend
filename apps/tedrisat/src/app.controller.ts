import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthCheckDto, AuthGuard } from '@madrasah/common';

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

  @Get('secure')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Secure endpoint',
    description: 'This endpoint is protected by JWT authentication',
  })
  getSecureData() {
    return { message: 'Bu endpoint JWT ile korunuyor.' };
  }
}
