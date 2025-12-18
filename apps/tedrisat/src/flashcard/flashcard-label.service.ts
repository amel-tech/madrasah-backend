import { Injectable } from '@nestjs/common';
import {
  ICreateFlashcardLabel,
  IFlashcardLabel,
  IFlashcardLabeling,
  IFlashcardLabelStats,
} from './flashcard-label.reporsitory.interface';

import { FlashcardLabelRepository } from './flashcard-label.reporsitory';

@Injectable()
export class FlashcardLabelService {
  constructor(private readonly flashcardLabelRepo: FlashcardLabelRepository) {}
  async createLabel(
    createLabelDto: ICreateFlashcardLabel,
  ): Promise<IFlashcardLabel> {
    return await this.flashcardLabelRepo.createLabel(createLabelDto);
  }
  async deleteLabel(labelId: string): Promise<boolean> {
    return await this.flashcardLabelRepo.delete(labelId);
  }
  async flashcardLabeling(
    newLabeling: IFlashcardLabeling,
  ): Promise<IFlashcardLabeling> {
    const labelStats = await this.flashcardLabelRepo.getLabelStats(
      newLabeling.labelId,
    );
    if (labelStats) {
      await this.flashcardLabelRepo.updateLabelStats(newLabeling.labelId);
    } else {
      await this.flashcardLabelRepo.createLabelStats({
        labelId: newLabeling.labelId,
        usageCount: 1,
        lastUsedAt: new Date(),
      });
    }
    return await this.flashcardLabelRepo.flashcardLabeling(newLabeling);
  }
  async getById(id: string): Promise<IFlashcardLabel | null> {
    return await this.flashcardLabelRepo.getById(id);
  }
  async getLabelStats(id: string): Promise<IFlashcardLabelStats | null> {
    return await this.flashcardLabelRepo.getLabelStats(id);
  }
}
