import { Injectable } from '@nestjs/common';
import {
  BulkFlashcardResponse,
  FlashcardResult,
} from './dto/flashcard-bulk-response.dto';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { validate } from '@nestjs/class-validator';
import { FlashcardService } from './flashcard.service';
import { FlashcardDeckService } from './flashcard-deck.service';
import { plainToClass } from '@nestjs/class-transformer';

@Injectable()
export class FlashcardBulkService {
  constructor(
    private readonly deckService: FlashcardDeckService,
    private readonly cardService: FlashcardService,
  ) {}

  public async AddFlashcards(
    deckId: string,
    authorId: string,
    cards: CreateFlashcardDto[],
  ): Promise<BulkFlashcardResponse> {
    const result = new BulkFlashcardResponse();

    const deck = await this.deckService.findById(deckId);
    if (deck == null) {
      result.errorMessage = 'Deck not found';
      return result;
    }

    const [cardResult, isError] = await this.ValidationCards(cards);
    if (isError) {
      result.flashcards = cardResult;
      result.errorMessage = 'Validation Error';
      return result;
    }

    const flashCards = await this.cardService.createMany(
      deckId,
      authorId,
      cards,
    );
    result.isSuccess = true;
    result.flashcards = flashCards.map((_) => ({
      success: true,
      errors: null,
      flashCardResponse: _,
    }));
    return result;
  }

  private async ValidationCards(
    cards: CreateFlashcardDto[],
  ): Promise<[results: FlashcardResult[], isError: boolean]> {
    const results = Array<FlashcardResult>();
    const items = plainToClass(CreateFlashcardDto, cards);

    let isError = false;
    for (const item of items) {
      const errors = await validate(item, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        results.push({
          success: false,
          errors: errors,
        });
        isError = true;
      }
    }

    return [results, isError];
  }
}
