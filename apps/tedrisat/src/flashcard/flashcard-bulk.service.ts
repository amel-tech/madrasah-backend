import { Injectable } from '@nestjs/common';
import {
  BulkFlashcardResponse,
  RowError,
  flattenValidationErrors,
} from './dto/flashcard-bulk-response.dto';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { validate } from '@nestjs/class-validator';
import { FlashcardService } from './flashcard.service';
import { plainToClass } from '@nestjs/class-transformer';
import { ExcelService } from '@madrasah/common';
import { FLASHCARD_EXCEL_CONFIG } from './dto/config-excel.dto';

export type BulkAddResult =
  | { success: true; data: BulkFlashcardResponse }
  | { success: false; error: 'VALIDATION_FAILED'; rowErrors: RowError[] };

@Injectable()
export class FlashcardBulkService {
  constructor(
    private readonly cardService: FlashcardService,
    private readonly excelService: ExcelService,
  ) {}

  public async addFlashcards(
    deckId: string,
    authorId: string,
    cards: CreateFlashcardDto[],
  ): Promise<BulkAddResult> {
    const [rowErrors, isError] = await this.validateCards(cards);
    if (isError) {
      return { success: false, error: 'VALIDATION_FAILED', rowErrors };
    }

    const flashCards = await this.cardService.createMany(deckId, authorId, cards);
    return { success: true, data: { count: flashCards.length } };
  }

  public async exportFlashcards(
    deckId: string,
    userId: string,
    title: string,
    format: 'xlsx' | 'csv' = 'xlsx',
  ) {
    const cards = await this.cardService.findByDeckId(deckId, userId);
    const data = cards.map((card) => ({
      type: card.type,
      contentFront: card.contentFront,
      contentBack: card.contentBack,
    }));

    return this.excelService.exportData(data, FLASHCARD_EXCEL_CONFIG, title, format);
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
