import { Injectable, NotFoundException } from '@nestjs/common';

import type { CreateCardDto } from './dto/create-card.dto';
import { Card } from './interfaces/card.interface';

@Injectable()
export class CardService {
  private cards: Card[] = [];

  createOne(user_id: number, createCardDto: CreateCardDto): Card {
    const newCardData = {
      id: Math.floor(Math.random() * (10000 - 2000 + 1) + 2000),
      author_id: user_id,
      ...createCardDto,
    };
    console.log('Added new', newCardData.type, 'card #' + newCardData.id);
    this.cards.push(newCardData);
    return newCardData;
  }

  findOne(id: number): Card {
    const card = this.cards.find((element) => element.id === id);
    if (!card) {
      throw new NotFoundException('Card #' + id + ' Not Found');
    }
    return card;
  }
}
