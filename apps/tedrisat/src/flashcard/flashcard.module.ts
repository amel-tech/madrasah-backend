import { Module } from '@nestjs/common';

import { FlashcardDeckController } from './flashcard-deck.controller';
import { FlashcardService } from './flashcard.service';
import { FlashcardDeckService } from './flashcard-deck.service';
import { FlashcardController } from './flashcard.controller';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { DatabaseService } from '../database/database.service';
import { FlashcardRepository } from './flashcard.repository';
import { FlashcardBulkService } from './flashcard-bulk.service';
import { AuthGuardModule } from '@madrasah/common';

@Module({
  imports: [AuthGuardModule],
  controllers: [FlashcardController, FlashcardDeckController],
  providers: [
    FlashcardService,
    FlashcardRepository,
    FlashcardDeckService,
    FlashcardDeckRepository,
    FlashcardBulkService,
    DatabaseService,
  ],
})
export class FlashcardModule {}
