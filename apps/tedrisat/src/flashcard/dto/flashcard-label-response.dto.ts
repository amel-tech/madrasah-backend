import { ApiProperty } from '@nestjs/swagger';
import { Scope } from '../domain/flashcard-label.enum';
import {
  CreateFlashcardLabelDto,
  CreateFlashcardLabelingDto,
} from './create-flashcard-label.dto';
import { IsNumber, IsString } from 'class-validator';
export class FlashcardCreateLabelResponse extends CreateFlashcardLabelDto {
  @ApiProperty()
  @IsString()
  declare title: string;
  @ApiProperty()
  declare createdBy: string;
  @ApiProperty()
  declare scope: Scope;
}
export class FlashcardLabelingResponse extends CreateFlashcardLabelingDto {
  @ApiProperty()
  @IsNumber()
  declare labelId: string;
  @ApiProperty()
  @IsNumber()
  declare flashcardId: string;
}
export class FlashcardLabelResponse {
  @ApiProperty()
  @IsString()
  declare title: string;
  @ApiProperty()
  @IsString()
  declare createdBy: string;
  @ApiProperty()
  declare scope: Scope;
}
export class labelStatsResponse {
  @ApiProperty()
  @IsString()
  declare labelId: string;
  @ApiProperty()
  declare usageCount: number;
  @ApiProperty()
  declare lastUsedAt: Date;
}
