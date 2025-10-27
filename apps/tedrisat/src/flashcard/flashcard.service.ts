import { Injectable } from '@nestjs/common';
import { FlashcardRepository } from './flashcard.repository';
import {
  ICreateFlashcard,
  IFlashcard,
  IFlashcardProgress,
  IUpdateFlashcard,
} from './flashcard.repository.interface';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { CreateFlashcardProgressDto } from './dto/create-flashcard-progress.dto';

@Injectable()
export class FlashcardService {
  constructor(private readonly cardRepo: FlashcardRepository) {}

  async findById(
    id: string,
    userId: string,
    include?: string[],
  ): Promise<IFlashcard | null> {
    return this.cardRepo.findById(id, userId, new Set(include));
  }

  async findByDeckId(
    deckId: string,
    userId: string,
    include?: string[],
  ): Promise<IFlashcard[]> {
    return this.cardRepo.findByDeckId(deckId, userId, new Set(include));
  }

  async createMany(
    deckId: string,
    authorId: string,
    cards: CreateFlashcardDto[],
  ): Promise<IFlashcard[]> {
    const newCards: ICreateFlashcard[] = cards.map((card) => ({
      ...card,
      deckId,
      authorId,
    }));
    return this.cardRepo.createMany(newCards);
  }

  async replaceManyProgress(
    userId: string,
    progress: CreateFlashcardProgressDto[],
  ): Promise<IFlashcardProgress[]> {
    const progressWithUser = progress.map((data) => ({
      userId,
      ...data,
    }));

    return this.cardRepo.replaceManyProgress(progressWithUser);
  }

  async update(
    id: string,
    updates: IUpdateFlashcard,
  ): Promise<IFlashcard | null> {
    return this.cardRepo.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.cardRepo.delete(id);
  }
}
