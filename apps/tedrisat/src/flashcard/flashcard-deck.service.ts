import { Injectable, NotImplementedException } from '@nestjs/common';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import {
  ICreateFlashcardDeck,
  IFlashcardDeck,
} from './flashcard-deck.repository.interface';

@Injectable()
export class FlashcardDeckService {
  constructor(private readonly deckRepo: FlashcardDeckRepository) {}

  async findById(
    id: number,
    include?: string[],
  ): Promise<IFlashcardDeck | null> {
    const includeSet = new Set(include);

    if (!includeSet.size) return this.deckRepo.findById(id);
    if (includeSet.has('cards')) throw new NotImplementedException();
    if (includeSet.has('tags')) return this.deckRepo.findByIdWithTags(id);
    else throw new NotImplementedException();
  }

  async create(newDeck: ICreateFlashcardDeck): Promise<IFlashcardDeck> {
    return this.deckRepo.create(newDeck);
  }
}
