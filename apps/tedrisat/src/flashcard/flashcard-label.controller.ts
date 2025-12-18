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
  labelStatsResponse,
} from './dto/flashcard-label-response.dto';
@Controller('flashcard-label')
export class FlashcardlabelController {
  constructor(private readonly labelService: FlashcardLabelService) {}
  @ApiBody({ type: CreateFlashcardLabelDto })
  @ApiResponse({ status: 200, type: FlashcardCreateLabelResponse })
  @Post('/create')
  async createFlashcardLabel(
    @Body() createLabelDto: CreateFlashcardLabelDto,
  ): Promise<FlashcardCreateLabelResponse> {
    return await this.labelService.createLabel(createLabelDto);
  }
  @ApiResponse({ status: 200, schema: { type: 'boolean' } })
  @Delete('/delete/:id')
  async deleteFlashcardLabel(@Param('id') labelId: string): Promise<boolean> {
    return await this.labelService.deleteLabel(labelId);
  }
  @ApiBody({ type: CreateFlashcardLabelingDto })
  @ApiResponse({ status: 200, type: FlashcardLabelingResponse })
  @Post('/labeling')
  async flahscardLabeling(
    @Body() newLabeling: CreateFlashcardLabelingDto,
  ): Promise<FlashcardLabelingResponse> {
    return await this.labelService.flashcardLabeling(newLabeling);
  }
  @ApiResponse({ status: 200, type: FlashcardLabelResponse })
  @Get('/:id')
  async getById(
    @Param('id') id: string,
  ): Promise<FlashcardLabelResponse | null> {
    return await this.labelService.getById(id);
  }
  @ApiResponse({ status: 200, type: labelStatsResponse })
  @Get('/getStats/:id')
  async getLabelStats(
    @Param('id') id: string,
  ): Promise<labelStatsResponse | null> {
    return await this.labelService.getLabelStats(id);
  }
}
