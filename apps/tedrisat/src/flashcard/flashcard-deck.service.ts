import { Injectable } from '@nestjs/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
  IUpdateFlashcardDeck,
} from './flashcard-deck.repository.interface';

@Injectable()
export class FlashcardDeckService {
  constructor(private readonly deckRepo: FlashcardDeckRepository) {}

  async findById(
    id: string,
    include?: string[],
  ): Promise<IFlashcardDeck | null> {
    const includeSet = new Set(include);
    return this.deckRepo.findById(id, includeSet);
  }

  async findAll(include?: string[]): Promise<IFlashcardDeck[]> {
    const includeSet = new Set(include);
    return this.deckRepo.findAll(includeSet);
  }

  async create(newDeck: ICreateFlashcardDeck): Promise<IFlashcardDeck> {
    return this.deckRepo.create(newDeck);
  }

  async update(
    id: string,
    updates: IUpdateFlashcardDeck,
  ): Promise<IFlashcardDeck | null> {
    return this.deckRepo.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.deckRepo.delete(id);
  }
}
