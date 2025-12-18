import { Module } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FlashcardLabelService } from './flashcard-label.service';
import { FlashcardLabelRepository } from './flashcard-label.reporsitory';
import { FlashcardDeckLabelService } from './flashcard-deck-label.service';
import { FlashcardDeckLabelRepository } from './flashcard-deck-label.repository';
import { FlashcardlabelController } from './flashcard-label.controller';
import { FlashcardDeckLabelController } from './flashcard-deck-label.controller';

@Module({
  controllers: [FlashcardlabelController, FlashcardDeckLabelController],
  providers: [
    FlashcardLabelService,
    FlashcardLabelRepository,
    FlashcardDeckLabelService,
    FlashcardDeckLabelRepository,
    DatabaseService,
  ],
})
export class FlashcardLabelModule {}
