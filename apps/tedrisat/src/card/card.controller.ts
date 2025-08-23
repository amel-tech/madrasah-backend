import { Delete, Get, Patch, Post } from '@nestjs/common';
import { Controller, Body, Param } from '@nestjs/common';
import { ParseIntPipe, UsePipes } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';

import { CardService } from './card.service';
import type { CreateCardDto } from './dto/create-card.dto';
import { CardValidationPipe } from './pipes/card-validation.pipe';
import { Card } from './interfaces/card.interface';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('add')
  @UsePipes(CardValidationPipe)
  createOne(@Body() createCardDto: CreateCardDto): Card {
    const user_id = 1; // TODO: validate user
    const new_card = this.cardService.createOne(user_id, createCardDto);
    return new_card;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Card {
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
