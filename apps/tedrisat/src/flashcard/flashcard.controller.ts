import {
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
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
import { AuthGuard, ExcelService } from '@madrasah/common';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';
import { FlashcardBulkService } from './flashcard-bulk.service';
import { BulkFlashcardResponse } from './dto/flashcard-bulk-response.dto';
import {
  FLASHCARD_EXCEL_CONFIG,
  FlashcardColumnDto,
} from './dto/config-excel.dto';
import { FileInterceptor } from '@nestjs/platform-express';
export enum CardIncludeEnum {
  Progress = 'progress',
}

@ApiTags('flashcard-cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('flashcard/')
export class FlashcardController {
  constructor(
    private readonly cardService: FlashcardService,
    private readonly cardBulkService: FlashcardBulkService,
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
  @IncludeApiQuery(CardIncludeEnum)
  @Get('cards/:id')
  async findById(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) cardId: string,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardResponse> {
    const userId = request.user.sub;
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
  @ApiQuery({ name: 'deckId', required: true, type: String })
  @IncludeApiQuery(CardIncludeEnum)
  @Get('cards')
  async findByDeckId(
    @Req() request: AuthorizedRequest,
    @Query('deckId', ParseUUIDPipe) deckId: string,
    @IncludeQuery() include?: string[],
  ): Promise<FlashcardResponse[]> {
    const userId = request.user.sub;
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
    @Req() request: AuthorizedRequest,
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Body(new ParseArrayPipe({ items: CreateFlashcardDto }))
    cardsDto: CreateFlashcardDto[],
  ): Promise<FlashcardResponse[]> {
    const authorId = request.user.sub;
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
    @Req() request: AuthorizedRequest,
    @Body(new ParseArrayPipe({ items: CreateFlashcardProgressDto }))
    progressDto: CreateFlashcardProgressDto[],
  ): Promise<FlashcardProgressResponse[]> {
    const userId = request.user.sub;
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
  @Post('decks/:deckId/cards/bulk')
  async bulk(
    @Req() request: AuthorizedRequest,
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Body()
    cardsDto: CreateFlashcardDto[],
  ): Promise<BulkFlashcardResponse> {
    const authorId = request.user.sub;
    return this.cardBulkService.AddFlashcards(deckId, authorId, cardsDto);
  }

  // Get Bulk Export File
  @Get('decks/cards/bulk/export')
  async downloadSample(
    @Query('format') format: 'xlsx' | 'csv' = 'xlsx',
  ) {
    return this.excelService.generateSample(
      FLASHCARD_EXCEL_CONFIG,
      format
    );
  }

  // Post Import File
  @Post('decks/:deckId/cards/bulk/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import flashcards from Excel/CSV' })
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
    @UploadedFile() file: Express.Multer.File,
    @Param('deckId', ParseUUIDPipe) deckId: string,
    @Req() request: AuthorizedRequest,
  ) {
    const format = this.excelService.detectFormat(file.originalname);
    const cards = await this.excelService.parseFile<FlashcardColumnDto>(
      file.buffer,
      FLASHCARD_EXCEL_CONFIG,
      format,
    );
    const authorId = request.user.sub;
    return await this.cardBulkService.AddFlashcards(deckId, authorId, [
      ...cards,
    ]);
  }
}
