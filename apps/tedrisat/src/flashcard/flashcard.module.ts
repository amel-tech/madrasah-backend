import { Module } from '@nestjs/common';

import { FlashcardDeckController } from './flashcard-deck.controller';
import { FlashcardService } from './flashcard.service';
import { FlashcardDeckService } from './flashcard-deck.service';
import { FlashcardController } from './flashcard.controller';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { DatabaseService } from '../database/database.service';
import { FlashcardRepository } from './flashcard.repository';

@Module({
  controllers: [FlashcardController, FlashcardDeckController],
  providers: [
    FlashcardService,
    FlashcardRepository,
    FlashcardDeckService,
    FlashcardDeckRepository,
    DatabaseService,
  ],
})
export class FlashcardModule {}
