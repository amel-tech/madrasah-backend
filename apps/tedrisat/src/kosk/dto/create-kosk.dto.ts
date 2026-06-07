import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKoskDto {
  @ApiProperty({ example: 'Süleymaniye Köşkü' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: '@suleymaniye' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  handle?: string;

  @ApiPropertyOptional({
    example:
      'Klasik medrese müfredatına dayalı; sarf, nahiv ve usûl-i fıkıh dersleri sunan köşk.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 215, minimum: 0, maximum: 360 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(360)
  coverHue?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({ example: 'Tefsir & Hadis', description: 'İlim alanı' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  field?: string;

  @ApiPropertyOptional({
    example: 'ALL',
    description: "'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  level?: string;

  @ApiPropertyOptional({ type: [String], example: ['Tefsir', 'Hadis'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
