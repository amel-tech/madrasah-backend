import {
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';

import { CreateFlashcardDeckDto } from './dto/create-flashcard-deck.dto';
import { FlashcardDeckResponse } from './dto/flashcard-deck-response.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateFlashcardDeckDto } from './dto/update-flashcard-deck.dto ';
import { FlashcardDeckService } from './flashcard-deck.service';

@ApiTags('flashcard-decks')
@Controller('flashcard/decks')
export class FlashcardDeckController {
  constructor(private readonly deckService: FlashcardDeckService) {}

  // GET Requests

  @ApiFoundResponse({ type: FlashcardDeckResponse })
  @Get(':id')
  async findByIdDeck(
    @Param('id', ParseIntPipe) deckId: number,
    @Query(
      'include',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    include?: string[],
  ): Promise<FlashcardDeckResponse | null> {
    return this.deckService.findById(deckId, include);
  }

  @ApiFoundResponse({ type: FlashcardDeckResponse })
  @Get(':id/cards')
  async findByIdDeckContent(
    @Param('id', ParseIntPipe) deckId: number,
    @Query(
      'include',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    include?: string[],
  ): Promise<FlashcardDeckResponse | null> {
    const includeWithCards = [...(include || []), 'cards'];
    return this.deckService.findById(deckId, includeWithCards);
  }

  @ApiFoundResponse({ type: FlashcardDeckResponse, isArray: true })
  @Get()
  findAllDeck(
    @Query(
      'include',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    include?: string[],
  ): FlashcardDeckResponse[] {
    console.log(include);
    throw new NotImplementedException();
  }

  // POST Requests

  @ApiCreatedResponse({ type: FlashcardDeckResponse })
  @Post()
  async createDeck(
    @Body() deckDto: CreateFlashcardDeckDto,
  ): Promise<FlashcardDeckResponse> {
    const { tagIds, ...newDeckContent } = deckDto;
    const newDeck = { authorId: 1, ...newDeckContent };
    const createdDeck = await this.deckService.create(newDeck);

    if (tagIds && tagIds.length) console.log('will add tags here'); // await this.tagService.createPairsMany(createdDeck.id, tagIds)
    return createdDeck;
  }

  // PUT Requests

  @ApiBody({ type: CreateFlashcardDeckDto })
  @ApiCreatedResponse({ type: FlashcardDeckResponse })
  @ApiOkResponse({ type: FlashcardDeckResponse })
  @Put(':id')
  replaceDeck(
    @Param('id', ParseIntPipe) deckId: number,
    @Body() deckDto: CreateFlashcardDeckDto,
  ): FlashcardDeckResponse {
    console.log(deckId, deckDto);
    throw new NotImplementedException();
  }

  // PATCH Requests

  @ApiBody({ type: UpdateFlashcardDeckDto })
  @ApiOkResponse({ type: FlashcardDeckResponse })
  @ApiForbiddenResponse()
  @Patch(':id')
  updateDeck(
    @Param('id', ParseIntPipe) deckId: number,
    @Body() deckDto: UpdateFlashcardDeckDto,
  ): FlashcardDeckResponse {
    console.log(deckId, deckDto);
    throw new NotImplementedException();
  }

  // DELETE Requests

  @ApiOkResponse()
  @Delete(':id')
  deleteDeck(@Param('id', ParseIntPipe) deckId: number) {
    console.log(deckId);
    throw new NotImplementedException();
  }
}
