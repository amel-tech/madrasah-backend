import {
  Delete,
  Get,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  Param,
  ParseArrayPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';

import { FlashcardService } from './flashcard.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
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
import {
  AuthGuard,
  Authz,
  AuthzGuard,
  byParam,
  byQuery,
  ENTITIES,
  ExcelService,
  ResourceRef,
  SCOPES,
} from '@madrasah/common';
import { Request } from 'express';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';
import { FlashcardBulkService } from './flashcard-bulk.service';
import {
  BulkFlashcardErrorResponse,
  BulkFlashcardResponse,
} from './dto/flashcard-bulk-response.dto';
import {
  FLASHCARD_EXCEL_CONFIG,
  FlashcardColumnDto,
} from './dto/config-excel.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FlashcardDeckService } from './flashcard-deck.service';
import { DeckNotFoundError } from './errors/deck-not-found.error';
import { BulkValidationError } from './errors/bulk-validation.error';
import { CardIncludeEnum } from './domain/card-include.enum';
import { FlashcardRepository } from './flashcard.repository';
import { ModuleRef } from '@nestjs/core';

/**
 * Resolver: a card endpoint authorizes against the card's parent deck.
 * Card → deck lookup happens inside the resolver via ModuleRef; if the
 * card is missing it raises NotFoundException, which the guard
 * propagates as 404.
 *
 * Defined here (next to the controller) instead of in a shared file so
 * the coupling between the route shape and the lookup is explicit.
 */
const cardParentDeck =
  (param = 'id') =>
  async (req: Request, mod: ModuleRef): Promise<ResourceRef> => {
    const rawCardId = (req.params as Record<string, unknown>)[param];
    const cardId = typeof rawCardId === 'string' ? rawCardId : '';
    const userId = (req as unknown as AuthorizedRequest).user?.sub ?? '';
    const cardRepo = mod.get(FlashcardRepository, { strict: false });
    const card = await cardRepo.findById(cardId, userId);
    if (!card) {
      throw new HttpException(
        `Flashcard with id ${cardId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return { entity: ENTITIES.FLASHCARD_DECK, id: card.deckId };
  };

@ApiTags('flashcard-cards')
@ApiBearerAuth()
@UseGuards(AuthGuard, AuthzGuard)
@Controller('flashcard/')
export class FlashcardController {
  constructor(
    private readonly cardService: FlashcardService,
    private readonly cardBulkService: FlashcardBulkService,
    private readonly deckService: FlashcardDeckService,
    private readonly excelService: ExcelService,
  ) {}

  // GET Requests

  @ApiOperation({
    summary: 'Get a single flashcard',
    description: 'Retrieves a specific flashcard by its unique identifier',
    operationId: 'getFlashcardById',
  })
  @ApiOkResponse({ type: FlashcardResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @IncludeApiQuery(CardIncludeEnum)
  @Authz(SCOPES.VIEW, cardParentDeck())
  @Get('cards/:id')
  async findById(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) cardId: string,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardResponse> {
    const card = await this.cardService.findById(
      cardId,
      request.user.sub,
      include,
    );
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
  @ApiForbiddenResponse()
  @ApiQuery({ name: 'deckId', required: true, type: String })
  @IncludeApiQuery(CardIncludeEnum)
  @Authz(SCOPES.VIEW, byQuery(ENTITIES.FLASHCARD_DECK, 'deckId'))
  @Get('cards')
  async findByDeckId(
    @Req() request: AuthorizedRequest,
    @Query('deckId', ParseUUIDPipe) deckId: string,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardResponse[]> {
    return this.cardService.findByDeckId(deckId, request.user.sub, include);
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
  @ApiForbiddenResponse()
  @Authz(SCOPES.CREATE_FLASHCARD, byParam(ENTITIES.FLASHCARD_DECK, 'deckId'))
  @Post('decks/:deckId/cards')
  async createMany(
    @Req() request: AuthorizedRequest,
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Body(new ParseArrayPipe({ items: CreateFlashcardDto }))
    cardsDto: CreateFlashcardDto[],
  ): Promise<FlashcardResponse[]> {
    return this.cardService.createMany(deckId, request.user.sub, cardsDto);
  }

  // PUT Requests

  @ApiOperation({
    summary: 'Create or update flashcard progress',
    operationId: 'replaceManyFlashcardProgress',
  })
  @ApiOkResponse({ type: [FlashcardProgressResponse] })
  @ApiBody({ type: [CreateFlashcardProgressDto] })
  @ApiForbiddenResponse()
  // Multi-resource batch: each flashcardId may live in a different
  // deck. The single-resource @Authz decorator cannot express this;
  // FlashcardService verifies every parent deck is reachable before
  // persisting.
  @Put('cards/progress')
  async replaceManyProgress(
    @Req() request: AuthorizedRequest,
    @Body(new ParseArrayPipe({ items: CreateFlashcardProgressDto }))
    progressDto: CreateFlashcardProgressDto[],
  ): Promise<FlashcardProgressResponse[]> {
    return this.cardService.replaceManyProgress(request.user, progressDto);
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
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_FLASHCARDS, cardParentDeck())
  @Put('cards/:id')
  async replace(
    @Param('id', ParseUUIDPipe) cardId: string,
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
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_FLASHCARDS, cardParentDeck())
  @Patch('cards/:id')
  async update(
    @Param('id', ParseUUIDPipe) cardId: string,
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
  @ApiForbiddenResponse()
  @Authz(SCOPES.MANAGE_FLASHCARDS, cardParentDeck())
  @Delete('cards/:id')
  async deleteDeck(
    @Param('id', ParseUUIDPipe) cardId: string,
  ): Promise<boolean> {
    return this.cardService.delete(cardId);
  }

  // Post Bulk
  @ApiOperation({
    summary: 'Bulk',
    description: 'Bulk Body Json',
    operationId: 'createFlashcardsBulk',
  })
  @ApiBody({ type: [CreateFlashcardDto] })
  @ApiCreatedResponse({ type: BulkFlashcardResponse })
  @ApiForbiddenResponse()
  @Authz(SCOPES.CREATE_FLASHCARD, byParam(ENTITIES.FLASHCARD_DECK, 'deckId'))
  @Post('decks/:deckId/cards/bulk')
  async bulk(
    @Req() request: AuthorizedRequest,
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Body()
    cardsDto: CreateFlashcardDto[],
  ): Promise<BulkFlashcardResponse> {
    const deck = await this.deckService.findById(deckId);
    if (!deck) throw new DeckNotFoundError(deckId);

    const result = await this.cardBulkService.addFlashcards(
      deckId,
      request.user.sub,
      cardsDto,
    );
    if (!result.success) throw new BulkValidationError(result.rowErrors);

    return result.data;
  }

  // Get Bulk Sample File
  @Get('cards/bulk/sample')
  @ApiOperation({
    summary: 'Download flashcard import template',
    description:
      'Downloads a sample file to use as a template for bulk import. Not deck-specific.',
    operationId: 'getSampleFile',
  })
  @ApiOkResponse({ type: StreamableFile })
  @ApiQuery({
    name: 'format',
    required: true,
    type: String,
    enum: ['xlsx', 'csv'],
    description: 'The format of the file to download',
  })
  async downloadSample(@Query('format') format: 'xlsx' | 'csv' = 'xlsx') {
    return this.excelService.generateSample(FLASHCARD_EXCEL_CONFIG, format);
  }

  // Get Export File
  @Authz(SCOPES.VIEW, byParam(ENTITIES.FLASHCARD_DECK, 'deckId'))
  @Get('decks/:deckId/cards/bulk/export')
  @ApiOperation({
    summary: 'Export flashcards from a deck',
    operationId: 'exportCards',
  })
  @ApiOkResponse({ type: StreamableFile })
  @ApiNotFoundResponse({ description: 'Deck not found' })
  @ApiForbiddenResponse()
  @ApiQuery({
    name: 'format',
    required: false,
    type: String,
    enum: ['xlsx', 'csv'],
    description: 'The format of the file to download',
  })
  async exportCards(
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Req() request: AuthorizedRequest,
    @Query('format') format: 'xlsx' | 'csv' = 'xlsx',
  ) {
    const deck = await this.deckService.findById(deckId);
    if (!deck) throw new DeckNotFoundError(deckId);

    return this.cardBulkService.exportFlashcards(
      deckId,
      request.user.sub,
      deck.title,
      format,
    );
  }

  // Post Import File
  @Authz(SCOPES.CREATE_FLASHCARD, byParam(ENTITIES.FLASHCARD_DECK, 'deckId'))
  @Post('decks/:deckId/cards/bulk/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import flashcards from Excel/CSV',
    operationId: 'importsCard',
  })
  @ApiCreatedResponse({ type: BulkFlashcardResponse })
  @ApiNotFoundResponse({ description: 'Deck not found' })
  @ApiForbiddenResponse()
  @ApiUnprocessableEntityResponse({ type: BulkFlashcardErrorResponse })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  async importCards(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType:
              /^(application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/csv|text\/plain|application\/octet-stream|application\/vnd\.ms-excel)$/,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Req() request: AuthorizedRequest,
  ) {
    const format = this.excelService.detectFormat(
      file.mimetype,
      file.originalname,
    );

    const cards = await this.excelService.parseFile<FlashcardColumnDto>(
      file.buffer,
      FLASHCARD_EXCEL_CONFIG,
      format,
    );

    if (cards == null || cards.length == 0)
      throw new HttpException(
        'The uploaded file contains no data rows. Please ensure the file has a header row and at least one data row.',
        HttpStatus.BAD_REQUEST,
      );
    const result = await this.cardBulkService.addFlashcards(
      deckId,
      request.user.sub,
      [...cards],
    );
    if (!result.success) throw new BulkValidationError(result.rowErrors);

    return result.data;
  }
}
