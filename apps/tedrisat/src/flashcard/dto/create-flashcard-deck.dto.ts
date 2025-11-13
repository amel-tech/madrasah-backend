import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
} from '@nestjs/class-validator';
import { MaxLength } from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlashcardDeckDto {
  @ApiProperty({ example: 'Colours - Vocabulary Deck' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @ApiProperty()
  @IsBoolean()
  isPublic!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;
}
