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

import { CreateFlashcardDeckDto } from './dto/create-flashcard-deck.dto';
import { FlashcardDeckResponse } from './dto/flashcard-deck-response.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ReplaceFlashcardDeckDto,
  UpdateFlashcardDeckDto,
} from './dto/update-flashcard-deck.dto';
import { FlashcardDeckService } from './flashcard-deck.service';

export enum DeckIncludeEnum {
  Tags = 'tags',
  Cards = 'cards',
  CardsUserData = 'cards:user_data',
}

@ApiTags('flashcard-decks')
@Controller('flashcard/decks')
export class FlashcardDeckController {
  constructor(private readonly deckService: FlashcardDeckService) {}

  // GET Requests

  @ApiFoundResponse({ type: FlashcardDeckResponse })
  @ApiNotFoundResponse()
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    isArray: true,
    enum: DeckIncludeEnum,
  })
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) deckId: number,
    @Query(
      'include',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    include?: string[],
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

  @ApiFoundResponse({ type: FlashcardDeckResponse })
  @ApiNotFoundResponse()
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    isArray: true,
    enum: DeckIncludeEnum,
  })
  @Get(':id/cards')
  async findByIdCards(
    @Param('id', ParseIntPipe) deckId: number,
    @Query(
      'include',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    include?: string[],
  ): Promise<FlashcardDeckResponse> {
    const includeWithCards = [...(include || []), 'cards'];
    const deck = await this.deckService.findById(deckId, includeWithCards);
    if (!deck) {
      throw new HttpException(
        `no deck was found by id #${deckId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return deck;
  }

  @ApiFoundResponse({ type: FlashcardDeckResponse, isArray: true })
  @Get()
  @ApiQuery({
    name: 'include',
    required: false,
    type: String,
    isArray: true,
    enum: DeckIncludeEnum,
  })
  async findAll(
    @Query(
      'include',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    include?: string[],
  ): Promise<FlashcardDeckResponse[]> {
    return this.deckService.findAll(include);
  }

  // POST Requests

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

  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) deckId: number): Promise<boolean> {
    return this.deckService.delete(deckId);
  }
}
