import { Delete, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';

import { FlashcardService } from './flashcard.service';
import {
  ApiBody,
  ApiCreatedResponse,
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
  createBulkCard(
    @Param('deckId', ParseIntPipe) deckId: number,
    @Body() cardsDto: CreateFlashcardDto[],
  ): FlashcardResponse[] {
    console.log(deckId, cardsDto);
    throw new NotImplementedException();
  }

  // PUT Requests

  @ApiBody({ type: CreateFlashcardDto })
  @ApiCreatedResponse({ type: FlashcardResponse })
  @ApiOkResponse({ type: FlashcardResponse })
  @Put('cards/:id')
  replaceDeck(
    @Param('id', ParseIntPipe) cardId: number,
    @Body() cardDto: CreateFlashcardDto,
  ): FlashcardResponse {
    console.log(cardId, cardDto);
    throw new NotImplementedException();
  }

  // PATCH Requests
  @ApiBody({ type: UpdateFlashcardDto })
  @ApiOkResponse({ type: FlashcardResponse })
  @Put('cards/:id')
  updateDeck(
    @Param('id', ParseIntPipe) cardId: number,
    @Body() cardDto: CreateFlashcardDto,
  ): FlashcardResponse {
    console.log(cardId, cardDto);
    throw new NotImplementedException();
  }

  // DELETE Requests

  @ApiOkResponse()
  @Delete('cards/:id')
  deleteDeck(@Param('id', ParseIntPipe) cardId: number) {
    console.log(cardId);
    throw new NotImplementedException();
  }
}
