import {
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';

import { CreateFlashcardDeckDto } from './dto/create-flashcard-deck.dto';
import { FlashcardDeckResponse } from './dto/flashcard-deck-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateFlashcardDeckDto } from './dto/update-flashcard-deck.dto';
import { FlashcardDeckService } from './flashcard-deck.service';
import {
  IncludeApiQuery,
  IncludeQuery,
} from './decorators/include-query.decorator';
import { AuthGuard } from '@madrasah/common';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';
import { FlashcardDeckUserResponse } from './dto/flashcard-deck-user-response.dto';

export enum DeckIncludeEnum {
  // Tags = 'tags',
}

@ApiTags('flashcard-decks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('flashcard/decks')
export class FlashcardDeckController {
  constructor(private readonly deckService: FlashcardDeckService) {}

  // GET Requests

  @ApiOperation({
    summary: "Get all flashcard decks in the user's collection",
    operationId: 'getAllFlashcardDecksByUser',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  @Get('/collections')
  async findAllUserCollections(
    @Req() request: AuthorizedRequest,
  ): Promise<FlashcardDeckResponse[]> {
    const userId = request.user.sub;
    return this.deckService.findAllByUser(userId);
  }

  @ApiOperation({
    summary: 'Get flashcard deck by ID',
    description:
      'Retrieves a single flashcard deck by its ID with optional includes for related data such as tags.',
    operationId: 'getFlashcardDeckById',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse })
  @ApiNotFoundResponse()
  @IncludeApiQuery(DeckIncludeEnum)
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) deckId: string,
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
    summary: 'Get all flashcard decks',
    description:
      'Retrieves all flashcard decks with optional includes for related data such as tags.',
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
    @Req() request: AuthorizedRequest,
    @Body() deckDto: CreateFlashcardDeckDto,
  ): Promise<FlashcardDeckResponse> {
    const userId = request.user.sub;
    const newDeck = { authorId: userId, ...deckDto };
    const createdDeck = await this.deckService.create(newDeck);

    return createdDeck;
  }

  @ApiOperation({
    summary: "Add a deck to the user's collection",
    description:
      'Creates a new association between a flashcard deck and the authenticated user.',
    operationId: 'createFlashcardDeckUser',
  })
  @ApiCreatedResponse({ type: FlashcardDeckUserResponse })
  @Post(':id/collections')
  async addToUserCollection(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) deckId: string,
  ): Promise<FlashcardDeckUserResponse> {
    const userId = request.user.sub;
    return this.deckService.addToUserCollection(userId, deckId);
  }

  // PUT Requests

  @ApiOperation({
    summary: 'Replace a flashcard deck completely',
    description:
      'Replaces all properties of an existing flashcard deck with new values. This is a complete replacement operation.',
    operationId: 'replaceFlashcardDeck',
  })
  @ApiBody({ type: CreateFlashcardDeckDto })
  // @ApiCreatedResponse({ type: FlashcardDeckResponse })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  @Put(':id')
  async replace(
    @Param('id', ParseUUIDPipe) deckId: string,
    @Body() deckDto: CreateFlashcardDeckDto,
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
    @Param('id', ParseUUIDPipe) deckId: string,
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
  async delete(@Param('id', ParseUUIDPipe) deckId: string): Promise<boolean> {
    return this.deckService.delete(deckId);
  }

  @ApiOperation({
    summary: "Delete a flashcard deck from user's collection",
    operationId: 'deleteFlashcardDeckUser',
  })
  @ApiOkResponse({ type: FlashcardDeckUserResponse })
  @Delete(':id/collections')
  async removeFromUserCollection(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) deckId: string,
  ): Promise<FlashcardDeckUserResponse> {
    const userId = request.user.sub;
    return this.deckService.removeFromUserCollection(userId, deckId);
  }
}
