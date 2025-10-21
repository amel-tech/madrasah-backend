import { IsEnum, IsNumber } from '@nestjs/class-validator';
import { FlashcardProgressStatus } from '../domain/flashcard-progress-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlashcardProgressDto {
  @ApiProperty()
  @IsNumber()
  flashcardId!: number;

  @ApiProperty({ enum: FlashcardProgressStatus })
  @IsEnum(FlashcardProgressStatus)
  status!: FlashcardProgressStatus;
}
