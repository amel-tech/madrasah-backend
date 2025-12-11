import {
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from '@nestjs/class-validator';
import { IsEnum } from '@nestjs/class-validator';
import { MaxLength } from '@nestjs/class-validator';

import { FlashcardType } from '../domain/flashcard-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashcardDto {
  @ApiProperty({ enum: FlashcardType })
  @IsEnum(FlashcardType)
  type!: FlashcardType;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  contentFront!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  contentBack!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  contentMeta?: unknown;
}
