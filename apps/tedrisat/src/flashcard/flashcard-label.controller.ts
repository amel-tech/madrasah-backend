import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FlashcardLabelService } from './flashcard-label.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  CreateFlashcardLabelDto,
  CreateFlashcardLabelingDto,
} from './dto/create-flashcard-label.dto';
import {
  FlashcardCreateLabelResponse,
  FlashcardLabelingResponse,
  FlashcardLabelResponse,
  LabelStatsResponse,
} from './dto/flashcard-label-response.dto';

@Controller('flashcard-label')
export class FlashcardlabelController {
  constructor(private readonly labelService: FlashcardLabelService) {}

  @ApiBody({ type: CreateFlashcardLabelDto })
  @ApiResponse({ status: 200, type: FlashcardCreateLabelResponse })
  @Post('/')
  async createFlashcardLabel(
    @Body() createLabelDto: CreateFlashcardLabelDto,
  ): Promise<FlashcardCreateLabelResponse> {
    return await this.labelService.createLabel(createLabelDto);
  }

  @ApiResponse({ status: 200, schema: { type: 'boolean' } })
  @Delete('/:id')
  async deleteFlashcardLabel(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ): Promise<boolean> {
    return this.labelService.deleteLabel(id, {
      userId: body.userId,
    });
  }

  @ApiBody({ type: CreateFlashcardLabelingDto })
  @ApiResponse({ status: 200, type: FlashcardLabelingResponse })
  @Post('/labeling')
  async flahscardLabeling(
    @Body() newLabeling: CreateFlashcardLabelingDto,
  ): Promise<FlashcardLabelingResponse> {
    return await this.labelService.flashcardLabeling({
      ...newLabeling,
      privateToUserId: newLabeling.privateToUserId ?? null,
    });
  }

  @Delete('/labeling/:labelingId')
  async removeFlashcardDeckLabeling(
    @Param('labelingId') labelingId: string,
    @Body() body: { userId: string },
  ): Promise<boolean> {
    return await this.labelService.removeFlascardLabeling(labelingId, {
      userId: body.userId,
    });
  }

  @ApiResponse({ status: 200, type: FlashcardLabelResponse })
  @Get('/:id')
  async getById(
    @Param('id') id: string,
  ): Promise<FlashcardLabelResponse | null> {
    return await this.labelService.getById(id);
  }

  @ApiResponse({ status: 200, type: LabelStatsResponse })
  @Get('/:id/stats')
  async getLabelStats(
    @Param('id') id: string,
  ): Promise<LabelStatsResponse | null> {
    return await this.labelService.getLabelStats(id);
  }

  @Get('/flashcard/:flashcardId')
  async getFlashcardLabels(@Param('flashcardId') flashcardId: string) {
    return await this.labelService.getLabelsByFlashcardId(flashcardId);
  }

  @Get('/available/:userId')
  async getAvailableLabels(@Param('userId') userId: string) {
    return await this.labelService.getAvailableLabels(userId);
  }
}
