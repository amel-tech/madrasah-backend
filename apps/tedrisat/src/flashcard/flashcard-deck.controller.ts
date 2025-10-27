import {
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';

import { CreateFlashcardDeckDto } from './dto/create-flashcard-deck.dto';
import { FlashcardDeckResponse } from './dto/flashcard-deck-response.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ReplaceFlashcardDeckDto,
  UpdateFlashcardDeckDto,
} from './dto/update-flashcard-deck.dto';
import { FlashcardDeckService } from './flashcard-deck.service';
import {
  IncludeApiQuery,
  IncludeQuery,
} from './decorators/include-query.decorator';

export enum DeckIncludeEnum {
  Tags = 'tags',
}

@ApiTags('flashcard-decks')
@Controller('flashcard/decks')
export class FlashcardDeckController {
  constructor(private readonly deckService: FlashcardDeckService) {}

  // GET Requests

  @ApiOperation({
    summary: 'Get flashcard deck by ID',
    description:
      'Retrieves a single flashcard deck by its ID with optional includes for related data such as tags and flashcards.',
    operationId: 'getFlashcardDeckById',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse })
  @ApiNotFoundResponse()
  @IncludeApiQuery(DeckIncludeEnum)
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) deckId: number,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardDeckResponse> {
    const deck = await this.deckService.findById(deckId, include);
    if (!deck) {
      throw new HttpException(
        `no deck was found by id #${deckId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return deck;
  }

  @ApiOperation({
    summary: 'Get flashcard deck with cards',
    description:
      'Retrieves a flashcard deck by its ID with all flashcards automatically included, plus optional additional includes.',
    operationId: 'getFlashcardDeckWithCards',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse })
  @ApiNotFoundResponse()
  @IncludeApiQuery(DeckIncludeEnum)
  @Get(':id/cards')
  async findByIdCards(
    @Param('id', ParseIntPipe) deckId: number,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardDeckResponse> {
    const includeWithCards = [...(include || []), 'flashcards'];
    const deck = await this.deckService.findById(deckId, includeWithCards);
    if (!deck) {
      throw new HttpException(
        `no deck was found by id #${deckId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return deck;
  }

  @ApiOperation({
    summary: 'Get all flashcard decks',
    description:
      'Retrieves all flashcard decks with optional includes for related data such as tags and flashcards.',
    operationId: 'getAllFlashcardDecks',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  @Get()
  @IncludeApiQuery(DeckIncludeEnum)
  async findAll(
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardDeckResponse[]> {
    return this.deckService.findAll(include);
  }

  // POST Requests

  @ApiOperation({
    summary: 'Create a new flashcard deck',
    description:
      'Creates a new flashcard deck with the provided details. Tags can be optionally associated with the deck.',
    operationId: 'createFlashcardDeck',
  })
  @ApiCreatedResponse({ type: FlashcardDeckResponse })
  @Post()
  async create(
    @Body() deckDto: CreateFlashcardDeckDto,
  ): Promise<FlashcardDeckResponse> {
    const { tagIds, ...newDeckContent } = deckDto;
    const newDeck = { authorId: 1, ...newDeckContent };
    const createdDeck = await this.deckService.create(newDeck);

    if (tagIds && tagIds.length) console.log('will add tags here'); // await this.tagService.createPairsMany(createdDeck.id, tagIds)
    return createdDeck;
  }

  // PUT Requests

  @ApiOperation({
    summary: 'Replace a flashcard deck completely',
    description:
      'Replaces all properties of an existing flashcard deck with new values. This is a complete replacement operation.',
    operationId: 'replaceFlashcardDeck',
  })
  @ApiBody({ type: ReplaceFlashcardDeckDto })
  // @ApiCreatedResponse({ type: FlashcardDeckResponse })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  @Put(':id')
  async replace(
    @Param('id', ParseIntPipe) deckId: number,
    @Body() deckDto: ReplaceFlashcardDeckDto,
  ): Promise<FlashcardDeckResponse> {
    const updatedDeck = await this.deckService.update(deckId, deckDto);
    if (!updatedDeck) {
      throw new HttpException(
        `deck #${deckId} was not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedDeck;
  }

  // PATCH Requests

  @ApiOperation({
    summary: 'Update a flashcard deck partially',
    description:
      'Updates specific properties of an existing flashcard deck. Only provided fields will be updated.',
    operationId: 'updateFlashcardDeck',
  })
  @ApiBody({ type: UpdateFlashcardDeckDto })
  @ApiOkResponse({ type: FlashcardDeckResponse })
  @ApiForbiddenResponse()
  @Patch(':id')
  async updateDeck(
    @Param('id', ParseIntPipe) deckId: number,
    @Body() deckDto: UpdateFlashcardDeckDto,
  ): Promise<FlashcardDeckResponse> {
    const updatedDeck = await this.deckService.update(deckId, deckDto);
    if (!updatedDeck) {
      throw new HttpException(
        `deck #${deckId} was not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedDeck;
  }

  // DELETE Requests

  @ApiOperation({
    summary: 'Delete a flashcard deck',
    description:
      'Permanently deletes a flashcard deck by its ID. This action cannot be undone and will also remove all associated flashcards.',
    operationId: 'deleteFlashcardDeck',
  })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) deckId: number): Promise<boolean> {
    return this.deckService.delete(deckId);
  }
}
