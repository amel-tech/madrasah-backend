import { Injectable } from '@nestjs/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
  IFlashcardDeckUser,
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

  async findAllByUser(userId: string): Promise<IFlashcardDeck[]> {
    return this.deckRepo.findAllByUser(userId);
  }

  async create(newDeck: ICreateFlashcardDeck): Promise<IFlashcardDeck> {
    return this.deckRepo.create(newDeck);
  }

  async createUser(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUser> {
    return this.deckRepo.createUser(userId, deckId);
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

  async deleteUser(
    userId: string,
    deckId: string,
  ): Promise<IFlashcardDeckUser> {
    return this.deckRepo.deleteUser(userId, deckId);
  }
}
