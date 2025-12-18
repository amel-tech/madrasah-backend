import { Body, Delete, Get, Param, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { FlashcardDeckLabelService } from './flashcard-deck-label.service';
import {
  CreateFlashcardDeckLabelDto,
  CreateFlashcardDeckLabelingDto,
} from './dto/create-flashcard-deck-label.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  DeckLabelStatsResponse,
  FlashcardDeckCreateLabelResponse,
  FlashcardDeckLabelingResponse,
  FlashcardDeckLabelResponse,
} from './dto/flashcard-deck-label-response.dto';

@Controller('flashcard-deck-label')
export class FlashcardDeckLabelController {
  constructor(private readonly labelService: FlashcardDeckLabelService) {}

  @ApiBody({ type: CreateFlashcardDeckLabelDto })
  @ApiResponse({ status: 200, type: FlashcardDeckCreateLabelResponse })
  @Post('/create')
  async createFlashcardDeckLabel(
    @Body() createLabelDto: CreateFlashcardDeckLabelDto,
  ): Promise<FlashcardDeckCreateLabelResponse> {
    return await this.labelService.createLabel(createLabelDto);
  }
  @ApiResponse({ status: 200, schema: { type: 'boolean' } })
  @Delete('/delete/:id')
  async deleteFlashcardDeckLabel(
    @Param('id') labelId: string,
  ): Promise<boolean> {
    return await this.labelService.deleteLabel(labelId);
  }
  @ApiBody({ type: CreateFlashcardDeckLabelingDto })
  @ApiResponse({ status: 200, type: FlashcardDeckLabelingResponse })
  @Post('/labeling')
  async deckLabeling(
    @Body() newLabeling: CreateFlashcardDeckLabelingDto,
  ): Promise<FlashcardDeckLabelingResponse> {
    return await this.labelService.deckLabeling(newLabeling);
  }
  @ApiResponse({ status: 200, type: FlashcardDeckLabelResponse })
  @Get('/:id')
  async getById(
    @Param('id') id: string,
  ): Promise<FlashcardDeckLabelResponse | null> {
    return await this.labelService.getById(id);
  }
  @ApiResponse({ status: 200, type: DeckLabelStatsResponse })
  @Get('/getStats/:id')
  async getLabelStats(
    @Param('id') id: string,
  ): Promise<DeckLabelStatsResponse | null> {
    return await this.labelService.getDeckLabelStats(id);
  }
}
