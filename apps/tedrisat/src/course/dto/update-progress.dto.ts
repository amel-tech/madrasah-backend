import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '../domain/enrollment-status.enum';

export class UpdateProgressDto {
  @ApiProperty({ example: 35, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  progress!: number;

  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
