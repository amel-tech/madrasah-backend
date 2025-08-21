import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = unknown> {
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
  meta?: Record<string, unknown>;

  constructor(
    success: boolean,
    message?: string,
    data?: T,
    meta?: Record<string, unknown>,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success<T>(
    data: T,
    message?: string,
    meta?: Record<string, unknown>,
  ): BaseResponseDto<T> {
    return new BaseResponseDto<T>(true, message, data, meta);
  }

  static error(
    message: string,
    meta?: Record<string, unknown>,
  ): BaseResponseDto<null> {
    return new BaseResponseDto<null>(false, message, null, meta);
  }
}