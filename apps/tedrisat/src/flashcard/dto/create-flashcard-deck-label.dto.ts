import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Scope } from '../domain/flashcard-label.enum';

export class CreateFlashcardDeckLabelDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @ApiProperty({ enum: Scope })
  @IsEnum(Scope)
  scope!: Scope;

  @ApiProperty()
  @IsUUID()
  createdBy!: string;

  @ApiProperty()
  @IsUUID()
  userId!: string;
}

export class CreateFlashcardDeckLabelingDto {
  @ApiProperty()
  @IsUUID()
  labelId!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsUUID()
  privateToUserId?: string;

  @ApiProperty()
  @IsUUID()
  deckId!: string;

  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty()
  @IsUUID()
  createdBy!: string;
}
