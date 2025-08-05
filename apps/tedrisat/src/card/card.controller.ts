import { Delete, Get, Patch, Post } from '@nestjs/common';
import { Controller, Body, Param } from '@nestjs/common';
import { ParseIntPipe, UsePipes } from '@nestjs/common';
import { NotImplementedException } from '@nestjs/common';

import { CardService } from './card.service';
import type { CreateCardDto } from './dto/create-card.dto';
import { CardValidationPipe } from './pipes/card-validation.pipe';


@Controller("card")
export class CardController {
    constructor(private readonly cardService: CardService) {}
    
    @Post("add")
    @UsePipes(CardValidationPipe)
    async createOne(@Body() createCardDto: CreateCardDto) {
        const user_id = 1;  // TODO: validate user
        const new_card = this.cardService.createOne(user_id, createCardDto);
        return new_card;
    }

    @Get(":id")
    async findOne(@Param("id", ParseIntPipe) id: number) {
        return this.cardService.findOne(id)
    }

    @Patch(":id")
    async updateOne() {
        // Update one card
        throw new NotImplementedException()
    }

    @Delete(":id")
    async deleteOne() {
        // Delete one card
    }
}