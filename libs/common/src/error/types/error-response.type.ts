import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ example: 'APP_ERROR' })
  type!: string;

  @ApiPropertyOptional({ example: 'RESOURCE_NOT_FOUND' })
  code?: string;

  @ApiProperty({ example: 422 })
  status!: number;

  @ApiProperty({ example: 'Validation Error' })
  message!: string;

  @ApiPropertyOptional()
  context?: Record<string, any>;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  timestamp!: string;
}
