import { Module } from '@nestjs/common';

import { FlashcardDeckController } from './flashcard-deck.controller';
import { FlashcardService } from './flashcard.service';
import { FlashcardDeckService } from './flashcard-deck.service';
import { FlashcardController } from './flashcard.controller';

@Module({
  controllers: [FlashcardController, FlashcardDeckController],
  providers: [FlashcardService, FlashcardDeckService],
})
export class FlashcardModule {}
