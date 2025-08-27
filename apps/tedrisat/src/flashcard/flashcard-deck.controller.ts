import {
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Controller, Body } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';

import { FlashcardService } from './flashcard.service';
import { CreateFlashcardDeckDto } from './dto/create-flashcard-deck.dto';
import {
  FlashcardDeckContentResponse,
  FlashcardDeckResponse,
} from './dto/flashcard-deck-response.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateFlashcardDeckDto } from './dto/update-flashcard-deck.dto ';

@ApiTags('flashcard-decks')
@Controller('flashcard/decks')
export class FlashcardDeckController {
  constructor(private readonly cardService: FlashcardService) {}

  // GET Requests

  @ApiFoundResponse({ type: FlashcardDeckResponse })
  @Get(':id')
  findByIdDeck(
    @Param('id', ParseIntPipe) deckId: number,
    @Query('includeTags', new DefaultValuePipe(false), ParseBoolPipe)
    includeTags: boolean,
  ): FlashcardDeckResponse {
    console.log(deckId, includeTags);
    throw new NotImplementedException();
  }

  @ApiFoundResponse({ type: FlashcardDeckContentResponse })
  @Get(':id/cards')
  findByIdDeckContent(
    @Param('id', ParseIntPipe) deckId: number,
    @Query('includeTags', new DefaultValuePipe(false), ParseBoolPipe)
    includeTags: boolean,
  ): FlashcardDeckContentResponse {
    console.log(deckId, includeTags);
    throw new NotImplementedException();
  }

  @ApiFoundResponse({ type: FlashcardDeckResponse, isArray: true })
  @Get()
  findAllDeck(
    @Query('includeTags', new DefaultValuePipe(false), ParseBoolPipe)
    includeTags: boolean,
  ): FlashcardDeckResponse[] {
    console.log(includeTags);
    throw new NotImplementedException();
  }

  // POST Requests

  @ApiBody({ type: [CreateFlashcardDeckDto] })
  @ApiCreatedResponse({ type: FlashcardDeckResponse, isArray: true })
  @Post()
  createBulkDeck(
    @Body() decksDto: CreateFlashcardDeckDto[],
  ): FlashcardDeckResponse[] {
    console.log(decksDto);
    throw new NotImplementedException();
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
