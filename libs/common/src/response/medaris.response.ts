import { ApiProperty } from '@nestjs/swagger';
import { MedarisMetaResponse } from './medaris-meta.response';

export class MedarisResponse<T = unknown> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Operation completed successfully',
  })
  message?: string;

  @ApiProperty({
    description: 'The actual data payload',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Additional metadata about the response',
    required: false,
    example: { timestamp: '2024-01-15T10:30:00.000Z', version: '1.0.0' },
  })
  meta?: MedarisMetaResponse;

  constructor(
    success: boolean,
    message?: string,
    data?: T,
    meta?: MedarisMetaResponse,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success<T>(
    data: T,
    message?: string,
    meta?: MedarisMetaResponse,
  ): MedarisResponse<T> {
    return new MedarisResponse<T>(true, message, data, meta);
  }

  static error(
    message: string,
    meta?: MedarisMetaResponse,
  ): MedarisResponse<null> {
    return new MedarisResponse<null>(false, message, null, meta);
  }
}