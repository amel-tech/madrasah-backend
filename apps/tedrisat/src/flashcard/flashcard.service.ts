import { Injectable } from '@nestjs/common';
import { FlashcardRepository } from './flashcard.repository';
import {
  ICreateFlashcard,
  IFlashcard,
  IUpdateFlashcard,
} from './flashcard.repository.interface';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';

@Injectable()
export class FlashcardService {
  constructor(private readonly cardRepo: FlashcardRepository) {}

  async createMany(
    deckId: number,
    authorId: number,
    cards: CreateFlashcardDto[],
  ): Promise<IFlashcard[]> {
    const newCards: ICreateFlashcard[] = cards.map((card) => ({
      ...card,
      deckId,
      authorId,
    }));
    return this.cardRepo.createMany(newCards);
  }

  async update(
    id: number,
    updates: IUpdateFlashcard,
  ): Promise<IFlashcard | null> {
    return this.cardRepo.update(id, updates);
  }

  async delete(id: number): Promise<boolean> {
    return this.cardRepo.delete(id);
  }
}
