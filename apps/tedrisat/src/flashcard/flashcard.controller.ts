import {
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';

import { FlashcardService } from './flashcard.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FlashcardResponse } from './dto/flashcard-response.dto';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { FlashcardProgressResponse } from './dto/flashcard-progress-response.dto';
import { CreateFlashcardProgressDto } from './dto/create-flashcard-progress.dto';
import {
  IncludeApiQuery,
  IncludeQuery,
} from './decorators/include-query.decorator';

export enum CardIncludeEnum {
  Progress = 'progress',
}

@ApiTags('flashcard-cards')
@Controller('flashcard/')
export class FlashcardController {
  constructor(private readonly cardService: FlashcardService) {}

  // GET Requests

  @ApiOperation({
    summary: 'Get a single flashcard',
    description: 'Retrieves a specific flashcard by its unique identifier',
    operationId: 'getFlashcardById',
  })
  @ApiOkResponse({ type: FlashcardResponse })
  @ApiNotFoundResponse()
  @IncludeApiQuery(CardIncludeEnum)
  @Get('cards/:id')
  async findById(
    @Param('id', ParseIntPipe) cardId: number,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardResponse> {
    const userId = 1;
    const card = await this.cardService.findById(cardId, userId, include);
    if (!card) {
      throw new HttpException(
        `could not find card #${cardId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return card;
  }

  @ApiOperation({
    summary: 'Get all flashcards from a deck',
    description: 'Retrieves all flashcards by matching a deck identifier',
    operationId: 'getFlashcardByDeckId',
  })
  @ApiOkResponse({ type: [FlashcardResponse] })
  @ApiQuery({ name: 'deckId', required: true, type: Number })
  @IncludeApiQuery(CardIncludeEnum)
  @Get('cards')
  async findByDeckId(
    @Query('deckId', ParseIntPipe) deckId: number,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardResponse[]> {
    if (!deckId) {
      throw new HttpException(
        'missing the required query: deckId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userId = 1;
    return this.cardService.findByDeckId(deckId, userId, include);
  }

  // POST Requests

  @ApiOperation({
    summary: 'Create multiple flashcards in a deck',
    description:
      'Creates multiple flashcards within a specified deck. All cards will be assigned to the same deck and author.',
    operationId: 'createFlashcards',
  })
  @ApiBody({ type: [CreateFlashcardDto] })
  @ApiCreatedResponse({ type: FlashcardResponse, isArray: true })
  @Post('decks/:deckId/cards')
  async createMany(
    @Param('deckId', ParseIntPipe) deckId: number,
    @Body(new ParseArrayPipe({ items: CreateFlashcardDto }))
    cardsDto: CreateFlashcardDto[],
  ): Promise<FlashcardResponse[]> {
    const authorId = 10;
    return this.cardService.createMany(deckId, authorId, cardsDto);
  }

  // PUT Requests

    @ApiOperation({
    summary: 'Create or update flashcard progress',
    operationId: 'replaceManyFlashcardProgress',
  })
  @ApiOkResponse({ type: [FlashcardProgressResponse] })
  @ApiBody({ type: [CreateFlashcardProgressDto] })
  @Put('cards/progress')
  async replaceManyProgress(
    @Body(new ParseArrayPipe({ items: CreateFlashcardProgressDto }))
    progressDto: CreateFlashcardProgressDto[],
  ): Promise<FlashcardProgressResponse[]> {
    const userId = 1;
    return this.cardService.replaceManyProgress(userId, progressDto);
  }

  @ApiOperation({
    summary: 'Replace a flashcard completely',
    description:
      'Replaces all properties of an existing flashcard with new values. This is a complete replacement operation.',
    operationId: 'replaceFlashcard',
  })
  @ApiBody({ type: CreateFlashcardDto })
  @ApiOkResponse({ type: FlashcardResponse })
  @ApiNotFoundResponse()
  @Put('cards/:id')
  async replace(
    @Param('id', ParseIntPipe) cardId: number,
    @Body() cardDto: CreateFlashcardDto,
  ): Promise<FlashcardResponse> {
    const updatedCard = await this.cardService.update(cardId, cardDto);
    if (!updatedCard) {
      throw new HttpException(
        `could not find card #${cardId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedCard;
  }

  // PATCH Requests
  @ApiOperation({
    summary: 'Update a flashcard partially',
    description:
      'Updates specific properties of an existing flashcard. Only provided fields will be updated.',
    operationId: 'updateFlashcard',
  })
  @ApiBody({ type: UpdateFlashcardDto })
  @ApiOkResponse({ type: FlashcardResponse })
  @ApiNotFoundResponse()
  @Patch('cards/:id')
  async update(
    @Param('id', ParseIntPipe) cardId: number,
    @Body() cardDto: UpdateFlashcardDto,
  ): Promise<FlashcardResponse> {
    const updatedCard = await this.cardService.update(cardId, cardDto);
    if (!updatedCard) {
      throw new HttpException(
        `could not find card #${cardId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedCard;
  }

  // DELETE Requests

  @ApiOperation({
    summary: 'Delete a flashcard',
    description:
      'Permanently deletes a flashcard by its ID. This action cannot be undone.',
    operationId: 'deleteFlashcard',
  })
  @ApiOkResponse()
  @Delete('cards/:id')
  async deleteDeck(
    @Param('id', ParseIntPipe) cardId: number,
  ): Promise<boolean> {
    return this.cardService.delete(cardId);
  }
}
