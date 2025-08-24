import { Injectable, NotFoundException } from '@nestjs/common';

import type { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { Flashcard } from './domain/flashcard.entity';

@Injectable()
export class FlashcardService {
  private cards: Flashcard[] = [];

  create(userId: number, createCardDto: CreateFlashcardDto): Flashcard {
    const newCardData = new Flashcard(
      Math.floor(Math.random() * (10000 - 2000 + 1) + 2000),
      createCardDto.type,
      userId,
      createCardDto.is_public,
      createCardDto.content,
      createCardDto.image_source,
    );

    console.log('Added new', newCardData.type, 'card #' + newCardData.id);
    this.cards.push(newCardData);
    return newCardData;
  }

  findById(id: number): Flashcard {
    const card = this.cards.find((element) => element.id === id);
    if (!card) {
      throw new NotFoundException('Card #' + id + ' Not Found');
    }
    return card;
  }
}
