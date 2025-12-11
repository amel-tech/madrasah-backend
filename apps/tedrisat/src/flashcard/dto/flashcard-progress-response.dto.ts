import { ApiProperty } from '@nestjs/swagger';
import { CreateFlashcardProgressDto } from './create-flashcard-progress.dto';

export class FlashcardProgressResponse extends CreateFlashcardProgressDto {
  @ApiProperty()
  userId!: string;
}
