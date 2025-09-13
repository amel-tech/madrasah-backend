import { Module } from '@nestjs/common';

import { FlashcardDeckController } from './flashcard-deck.controller';
import { FlashcardService } from './flashcard.service';
import { FlashcardDeckService } from './flashcard-deck.service';
import { FlashcardController } from './flashcard.controller';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [FlashcardController, FlashcardDeckController],
  providers: [FlashcardService, FlashcardDeckService, FlashcardDeckRepository, DatabaseService],
})
export class FlashcardModule {}
