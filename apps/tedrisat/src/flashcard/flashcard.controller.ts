import {
  Delete,
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
  ApiTags,
} from '@nestjs/swagger';
import { FlashcardResponse } from './dto/flashcard-response.dto';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

@ApiTags('flashcard-cards')
@Controller('flashcard/')
export class FlashcardController {
  constructor(private readonly cardService: FlashcardService) {}

  // POST Requests

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

  @ApiOkResponse()
  @Delete('cards/:id')
  async deleteDeck(
    @Param('id', ParseIntPipe) cardId: number,
  ): Promise<boolean> {
    return this.cardService.delete(cardId);
  }
}
