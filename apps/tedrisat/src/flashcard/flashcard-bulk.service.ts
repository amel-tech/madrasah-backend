import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BulkFlashcardErrorResponse,
  BulkFlashcardResponse,
  RowError,
  flattenValidationErrors,
} from './dto/flashcard-bulk-response.dto';
import { BulkValidationError } from './errors/bulk-validation.error';
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

  public async addFlashcards(
    deckId: string,
    authorId: string,
    cards: CreateFlashcardDto[],
  ): Promise<BulkFlashcardResponse> {
    const deck = await this.deckService.findById(deckId);
    if (deck == null) {
      throw new NotFoundException('Deck not found');
    }

    const [rowErrors, isError] = await this.validateCards(cards);
    if (isError) {
      const errorResponse: BulkFlashcardErrorResponse = {
        errors: rowErrors,
        isSuccess: false,
        errorMessage: 'Validation Error',
      };
      throw new BulkValidationError(errorResponse);
    }

    const flashCards = await this.cardService.createMany(deckId, authorId, cards);
    return { count: flashCards.length, isSuccess: true };
  }

  private async validateCards(
    cards: CreateFlashcardDto[],
  ): Promise<[rowErrors: RowError[], isError: boolean]> {
    const rowErrors: RowError[] = [];
    const items = plainToClass(CreateFlashcardDto, cards);
    let isError = false;

    for (let i = 0; i < items.length; i++) {
      const errors = await validate(items[i], {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        rowErrors.push({
          row: i + 2, // +2: 1-based index + header row
          errors: flattenValidationErrors(errors),
        });
        isError = true;
      }
    }

    return [rowErrors, isError];
  }
}
