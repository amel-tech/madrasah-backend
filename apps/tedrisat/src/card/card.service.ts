import { Injectable, NotFoundException } from '@nestjs/common';

import type { CreateCardDto } from './dto/create-card.dto';
import { CardType } from './enums/card-type.enum';
import { Card } from './interfaces/card.interface';

import { readFileSync } from 'fs';  // temporary


@Injectable()
export class CardService {
    private cards: Card[] = readMockData("./mock/example.data.json")

    async createOne(user_id: number, createCardDto: CreateCardDto) {
        const newCardData = {
            "id": Math.floor(Math.random() * (10000 - 2000 + 1) + 2000),
            "author_id": user_id,
            ...createCardDto,
            
        }
        console.log('Added new', newCardData.type, 'card #' + newCardData.id)
        this.cards.push(newCardData);
        return newCardData;
    }

    async findOne(id: number) {
        const card = this.cards.find(element => element.id === id);
        if (!card) {
            throw new NotFoundException("Card #" + id + " Not Found");
        }
        return card;
    }
}

function readMockData(filePath: string): Card[] {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    console.log("Loaded mock data.");
    return data;
  } catch (error) {
    console.warn("Mock data could not be loaded. Starting empty database.");
    return [];
  }
}