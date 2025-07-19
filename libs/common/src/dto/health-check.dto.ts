import { IsString, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({
    description: 'Service health status',
    enum: ['ok', 'error', 'degraded'],
    example: 'ok'
  })
  @IsIn(['ok', 'error', 'degraded'])
  status: 'ok' | 'error' | 'degraded';

  @ApiProperty({
    description: 'Timestamp when health check was performed',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'Name of the service',
    example: 'teskilat'
  })
  @IsString()
  service: string;

  @ApiProperty({
    description: 'Version of the service',
    example: '1.0.0',
    required: false
  })
  @IsString()
  version?: string;

  @ApiProperty({
    description: 'Environment the service is running in',
    example: 'development',
    required: false
  })
  @IsString()
  environment?: string;

  constructor(
    service: string,
    status: 'ok' | 'error' | 'degraded' = 'ok',
    version?: string,
    environment?: string
  ) {
    this.status = status;
    this.timestamp = new Date().toISOString();
    this.service = service;
    this.version = version;
    this.environment = environment;
  }
}
