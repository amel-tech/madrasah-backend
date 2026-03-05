import { Injectable } from '@nestjs/common';
import {
  ICreateFlashcardLabel,
  ICreateFlashcardLabeling,
  IFlashcardLabel,
  IFlashcardLabeling,
  IFlashcardLabelStats,
} from './flashcard-label.repository.interface';

import { FlashcardLabelRepository } from './flashcard-label.repository';

@Injectable()
export class FlashcardLabelService {
  constructor(private readonly flashcardLabelRepo: FlashcardLabelRepository) {}

  async createLabel(
    createLabelDto: ICreateFlashcardLabel,
  ): Promise<IFlashcardLabel> {
    return await this.flashcardLabelRepo.createLabel(createLabelDto);
  }

  async deleteLabel(
    labelId: string,
    ctx: { userId: string },
  ): Promise<boolean> {
    const label = await this.flashcardLabelRepo.getById(labelId);
    if (!label) return false;
    if (ctx.userId !== label.userId) return false;

    return await this.flashcardLabelRepo.delete(labelId);
  }

  async flashcardLabeling(
    newLabeling: ICreateFlashcardLabeling,
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

  async removeFlascardLabeling(
    labelingId: string,
    ctx: { userId: string },
  ): Promise<boolean> {
    const labeling = await this.flashcardLabelRepo.getLabeling(labelingId);
    if (!labeling) return false;

    if (labeling.userId !== ctx.userId) return false;

    if (
      labeling.privateToUserId !== null &&
      labeling.privateToUserId !== ctx.userId
    ) {
      return false;
    }

    await this.flashcardLabelRepo.decrementLabelStats(labeling.labelId);

    return await this.flashcardLabelRepo.RemoveLabeling(labelingId);
  }

  async getById(id: string): Promise<IFlashcardLabel | null> {
    return await this.flashcardLabelRepo.getById(id);
  }

  async getLabelStats(id: string): Promise<IFlashcardLabelStats | null> {
    return await this.flashcardLabelRepo.getLabelStats(id);
  }

  async getLabelsByFlashcardId(flashcardId: string) {
    return await this.flashcardLabelRepo.getLabelsByFlashcardId(flashcardId);
  }

  async getAvailableLabels(userId: string) {
    return await this.flashcardLabelRepo.getAvailableLabels(userId);
  }
}
