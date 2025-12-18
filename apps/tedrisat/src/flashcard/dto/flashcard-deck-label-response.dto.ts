import { ApiProperty } from '@nestjs/swagger';
import {
  CreateFlashcardDeckLabelDto,
  CreateFlashcardDeckLabelingDto,
} from './create-flashcard-deck-label.dto';
import { IsNumber, IsString } from '@nestjs/class-validator';
import { Scope } from '../domain/flashcard-label.enum';
export class FlashcardDeckCreateLabelResponse extends CreateFlashcardDeckLabelDto {
  @ApiProperty()
  @IsString()
  declare title: string;
  @ApiProperty()
  declare createdBy: string;
  @ApiProperty()
  declare scope: Scope;
  @ApiProperty()
  declare createdAt: Date;
}

export class FlashcardDeckLabelingResponse extends CreateFlashcardDeckLabelingDto {
  @ApiProperty()
  @IsNumber()
  declare labelId: string;
  @ApiProperty()
  @IsNumber()
  declare deckId: string;
}
export class FlashcardDeckLabelResponse {
  @ApiProperty()
  @IsString()
  declare title: string;
  @ApiProperty()
  @IsString()
  declare createdBy: string;
  @ApiProperty()
  declare scope: Scope;
}
export class DeckLabelStatsResponse {
  @ApiProperty()
  @IsString()
  declare labelId: string;
  @ApiProperty()
  declare usageCount: number;
  @ApiProperty()
  declare lastUsedAt: Date;
}
