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

import { FlashcardService } from './flashcard.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FlashcardResponse } from './dto/flashcard-response.dto';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { FlashcardProgressResponse } from './dto/flashcard-progress-response.dto';
import { CreateFlashcardProgressDto } from './dto/create-flashcard-progress.dto';

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
  @Get('cards/:id')
  async findById(
    @Param('id', ParseIntPipe) cardId: number,
  ): Promise<FlashcardResponse> {
    const card = await this.cardService.findById(cardId);
    if (!card) {
      throw new HttpException(
        `could not find card #${cardId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return card;
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
    @Body() cardsDto: CreateFlashcardDto[],
  ): Promise<FlashcardResponse[]> {
    const authorId = 10;
    return this.cardService.createMany(deckId, authorId, cardsDto);
  }

  // PUT Requests

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

  @ApiOperation({
    summary: 'Create or update flashcard progress',
    operationId: 'replaceManyFlashcardProgress',
  })
  @ApiOkResponse({ type: [FlashcardProgressResponse] })
  @ApiBody({ type: [CreateFlashcardProgressDto] })
  @Put('cards/progress')
  async replaceManyProgress(
    @Body() progressDto: CreateFlashcardProgressDto[],
  ): Promise<FlashcardProgressResponse[]> {
    const userId = 1;
    return this.cardService.replaceManyProgress(userId, progressDto);
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
