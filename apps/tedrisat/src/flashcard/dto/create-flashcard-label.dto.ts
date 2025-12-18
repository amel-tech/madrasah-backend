import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scope } from '../domain/flashcard-label.enum';
import { IsOptional, IsUUID } from 'class-validator';
export class CreateFlashcardLabelDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @ApiProperty()
  @IsEnum(Scope)
  scope!: Scope;

  @ApiProperty()
  @IsUUID()
  @IsString()
  createdBy!: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  userId!: string;
}
export class CreateFlashcardLabelingDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  labelId!: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  privateToUserId: string | null = null;

  @ApiProperty()
  @IsUUID()
  @IsString()
  flashcardId!: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  createdBy!: string;
}
