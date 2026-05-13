import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scope } from '../domain/flashcard-label.enum';
import { IsOptional, IsUUID } from 'class-validator';
export class CreateFlashcardDeckLabelDto {
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
}
export class CreateFlashcardDeckLabelingDto {
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
  deckId!: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  createdBy!: string;
}
