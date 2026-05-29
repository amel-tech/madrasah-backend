import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel } from '../domain/course-level.enum';
import { CourseStatus } from '../domain/course-status.enum';
import { LessonType } from '../domain/lesson-type.enum';

export class CreateLessonDto {
  @ApiPropertyOptional({
    description: 'Existing lesson id (preserved on replace)',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Birinci babın îsâgûcîsi' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: LessonType, example: LessonType.VIDEO })
  @IsEnum(LessonType)
  type!: LessonType;

  @ApiPropertyOptional({ example: '28 dk' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  duration?: string;

  @ApiPropertyOptional({ example: 'Bina · s. 4-9' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  kaynak?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export class CreateWeekDto {
  @ApiPropertyOptional({
    description: 'Existing week id (preserved on replace)',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  weekNumber!: number;

  @ApiProperty({ example: 'Sülâsî Mücerred — Birinci Bab' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    example: 'Müfredat tanıtımı ve birinci babın îsâgûcîsi.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiProperty({ type: [CreateLessonDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons!: CreateLessonDto[];
}

export class CreateMuderrisDto {
  @ApiPropertyOptional({
    description: 'Existing müderris row id (preserved on replace)',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'Linked platform user id, if any' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'Müderris Ahmed Hilmi' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Sarf ve Nahiv Müderrisi' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: 145, minimum: 0, maximum: 360 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(360)
  avatarHue?: number;
}

export class CreateResourceDto {
  @ApiPropertyOptional({
    description: 'Existing resource row id (preserved on replace)',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Bina ve İzhar — Klasik metin' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'PDF · 124 sayfa' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  meta?: string;

  @ApiPropertyOptional({ example: 'pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Bina ve İzhar Şerhi' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    example: 'Klasik sarf metni — şerh, illet ve tatbiki örneklerle.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'Sarf' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ enum: CourseLevel, example: CourseLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ example: 'Türkçe / Arapça' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  language?: string;

  @ApiPropertyOptional({ example: 145, minimum: 0, maximum: 360 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(360)
  coverHue?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationWeeks?: number;

  @ApiPropertyOptional({ enum: CourseStatus, example: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  grantsCertificate?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'When true, enrollments need köşk-owner approval.',
  })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ type: [CreateWeekDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWeekDto)
  weeks?: CreateWeekDto[];

  @ApiPropertyOptional({ type: [CreateMuderrisDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMuderrisDto)
  muderris?: CreateMuderrisDto[];

  @ApiPropertyOptional({ type: [CreateResourceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResourceDto)
  resources?: CreateResourceDto[];
}
