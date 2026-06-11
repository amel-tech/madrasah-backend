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
  ParseBoolPipe,
  Query,
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
  ApiQuery,
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
import {
  AuthGuard,
  Authz,
  AuthzGuard,
  byParam,
  ENTITIES,
  SCOPES,
} from '@madrasah/common';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';
import { FlashcardDeckUserResponse } from './dto/flashcard-deck-user-response.dto';

export enum DeckIncludeEnum {
  // Tags = 'tags',
}

@ApiTags('flashcard-decks')
@ApiBearerAuth()
@UseGuards(AuthGuard, AuthzGuard)
@Controller('flashcard/decks')
export class FlashcardDeckController {
  constructor(private readonly deckService: FlashcardDeckService) {}

  // GET Requests

  @ApiOperation({
    summary: "Get all flashcard decks in the user's collection",
    operationId: 'getAllFlashcardDecksByUser',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  // Self-scoped: the repository filters by `decksUsers.userId = caller`
  // AND (isPublic OR authorId = caller), so visibility is enforced at
  // the data layer. AuthGuard suffices.
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
  @ApiForbiddenResponse()
  @IncludeApiQuery(DeckIncludeEnum)
  @Authz(SCOPES.VIEW, byParam(ENTITIES.FLASHCARD_DECK))
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
    summary: 'Get all flashcard decks visible to the user',
    description:
      'Retrieves all flashcard decks that are either public or owned by the user, with optional includes for related data such as tags.',
    operationId: 'getAllFlashcardDecks',
  })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  @ApiQuery({
    name: 'isPublic',
    required: false,
    type: Boolean,
    description:
      'When omitted returns public decks and user-owned private decks. When true returns only public decks. When false returns only user-owned private decks.',
  })
  // Self-scoped listing — repository filters by `isPublic OR authorId`.
  @Get()
  @IncludeApiQuery(DeckIncludeEnum)
  async findAll(
    @Req() request: AuthorizedRequest,
    @Query('isPublic', new ParseBoolPipe({ optional: true }))
    isPublic?: boolean,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardDeckResponse[]> {
    const userId = request.user.sub;
    const filters = isPublic !== undefined ? { isPublic } : undefined;
    return this.deckService.findAllVisibleToUser(userId, filters, include);
  }

  // POST Requests

  @ApiOperation({
    summary: 'Create a new flashcard deck',
    description:
      'Creates a new flashcard deck. Publishing (`isPublic = true`) requires the SYSTEM_ADMIN realm role; non-admin callers can only create private decks.',
    operationId: 'createFlashcardDeck',
  })
  @ApiCreatedResponse({ type: FlashcardDeckResponse })
  @ApiForbiddenResponse()
  // `create_private_deck` is granted to PUBLIC in the matrix → any
  // authenticated caller may create their own private deck.
  // Publishing (`isPublic: true`) is gated by the service.
  @Authz(SCOPES.CREATE_PRIVATE_DECK, () => ({
    entity: ENTITIES.FLASHCARD_DECK,
    id: 'new',
  }))
  @Post()
  async create(
    @Req() request: AuthorizedRequest,
    @Body() deckDto: CreateFlashcardDeckDto,
  ): Promise<FlashcardDeckResponse> {
    const newDeck = { authorId: request.user.sub, ...deckDto };
    return this.deckService.create(request.user, newDeck);
  }

  @ApiOperation({
    summary: "Add a deck to the user's collection",
    description:
      'Creates a new association between a flashcard deck and the authenticated user.',
    operationId: 'createFlashcardDeckUser',
  })
  @ApiCreatedResponse({ type: FlashcardDeckUserResponse })
  @ApiForbiddenResponse()
  // Attaching a deck to your own collection requires the same right as
  // viewing it: public decks open to all, private decks only to owners.
  @Authz(SCOPES.VIEW, byParam(ENTITIES.FLASHCARD_DECK))
  @Post(':id/collections')
  async addToUserCollection(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) deckId: string,
  ): Promise<FlashcardDeckUserResponse> {
    return this.deckService.addToUserCollection(request.user.sub, deckId);
  }

  // PUT Requests

  @ApiOperation({
    summary: 'Replace a flashcard deck completely',
    description:
      'Replaces all properties of an existing flashcard deck with new values. This is a complete replacement operation.',
    operationId: 'replaceFlashcardDeck',
  })
  @ApiBody({ type: ReplaceFlashcardDeckDto })
  @ApiOkResponse({ type: FlashcardDeckResponse, isArray: true })
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_PRIVATE_DECK, byParam(ENTITIES.FLASHCARD_DECK))
  @Put(':id')
  async replace(
    @Param('id', ParseUUIDPipe) deckId: string,
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
  @Authz(SCOPES.MANAGE_PRIVATE_DECK, byParam(ENTITIES.FLASHCARD_DECK))
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
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_PRIVATE_DECK, byParam(ENTITIES.FLASHCARD_DECK))
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
    return this.deckService.removeFromUserCollection(request.user.sub, deckId);
  }
}
