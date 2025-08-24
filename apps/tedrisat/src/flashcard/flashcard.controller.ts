import { Delete, Get, Patch, Post } from '@nestjs/common';
import { Controller, Body, Param } from '@nestjs/common';
import { ParseIntPipe, UsePipes } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';

import { FlashcardService } from './flashcard.service';
import type { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { FlashcardValidationPipe } from './pipes/flashcard-validation.pipe';
import { Flashcard } from './interfaces/flashcard.interface';

@Controller('flashcard/')
export class FlashcardController {
  constructor(private readonly cardService: FlashcardService) {}

  @Post('add')
  @UsePipes(FlashcardValidationPipe)
  createOne(@Body() createFlashcardDto: CreateFlashcardDto): Flashcard {
    const user_id = 1; // TODO: validate user
    const new_card = this.cardService.createOne(user_id, createFlashcardDto);
    return new_card;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Flashcard {
    return this.cardService.findOne(id);
  }

  @Patch(':id')
  updateOne() {
    // Update one card
    throw new NotImplementedException();
  }

  @Delete(':id')
  deleteOne() {
    // Delete one card
    throw new NotImplementedException();
  }
}
