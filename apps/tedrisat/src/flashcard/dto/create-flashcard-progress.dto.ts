import { IsEnum, IsUUID } from '@nestjs/class-validator';
import { FlashcardProgressStatus } from '../domain/flashcard-progress-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlashcardProgressDto {
  @ApiProperty()
  @IsUUID()
  flashcardId!: string;

  @ApiProperty({ enum: FlashcardProgressStatus })
  @IsEnum(FlashcardProgressStatus)
  status!: FlashcardProgressStatus;
}
