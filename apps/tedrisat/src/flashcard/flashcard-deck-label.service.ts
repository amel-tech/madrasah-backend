import { Injectable } from '@nestjs/common';
import { FlashcardDeckLabelRepository } from './flashcard-deck-label.repository';
import {
  ICreateFlashcardDeckLabel,
  IFlashcardDeckLabel,
  IFlashcardDeckLabeling,
  IFlashcardDeckLabelStats,
} from './flashcard-deck-label.repository.interface';

@Injectable()
export class FlashcardDeckLabelService {
  constructor(private readonly labelRepository: FlashcardDeckLabelRepository) {}
  async createLabel(
    createTagDto: ICreateFlashcardDeckLabel,
  ): Promise<IFlashcardDeckLabel> {
    return await this.labelRepository.create(createTagDto);
  }
  async deleteLabel(labelId: string): Promise<boolean> {
    return await this.labelRepository.delete(labelId);
  }
  async deckLabeling(
    newLabeling: IFlashcardDeckLabeling,
  ): Promise<IFlashcardDeckLabeling> {
    const labelStats = await this.labelRepository.getLabelStats(
      newLabeling.labelId,
    );
    if (labelStats) {
      await this.labelRepository.updateLabelStats(newLabeling.labelId);
    } else {
      await this.labelRepository.createLabelStats({
        labelId: newLabeling.labelId,
        usageCount: 1,
        lastUsedAt: new Date(),
      });
    }
    return await this.labelRepository.deckLabeling(newLabeling);
  }
  async getById(id: string): Promise<IFlashcardDeckLabel | null> {
    return await this.labelRepository.getById(id);
  }
  async getDeckLabelStats(
    id: string,
  ): Promise<IFlashcardDeckLabelStats | null> {
    return await this.labelRepository.getLabelStats(id);
  }
}
