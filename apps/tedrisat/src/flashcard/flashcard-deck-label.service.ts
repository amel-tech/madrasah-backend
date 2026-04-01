import { Injectable } from '@nestjs/common';
import { FlashcardDeckLabelRepository } from './flashcard-deck-label.repository';
import {
  ICreateFlashcardDeckLabel,
  ICreateFlashcardDeckLabeling,
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

  async deleteLabel(
    labelId: string,
    ctx: { userId: string },
  ): Promise<boolean> {
    const label = await this.labelRepository.getById(labelId);
    if (!label) return false;
    if (ctx.userId !== label.userId) return false;
    return await this.labelRepository.delete(labelId);
  }

  async deckLabeling(
    newLabeling: ICreateFlashcardDeckLabeling,
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

  async removeDeckLabeling(
    labelingId: string,
    ctx: { userId: string },
  ): Promise<boolean> {
    const labeling = await this.labelRepository.getLabeling(labelingId);
    if (!labeling) return false;

    if (labeling.userId !== ctx.userId) return false;

    if (
      labeling.privateToUserId !== null &&
      labeling.privateToUserId !== ctx.userId
    ) {
      return false;
    }

    await this.labelRepository.decrementLabelStats(labeling.labelId);

    return await this.labelRepository.RemoveDeckLabeling(labelingId);
  }

  async getById(id: string): Promise<IFlashcardDeckLabel | null> {
    return await this.labelRepository.getById(id);
  }

  async getDeckLabelStats(
    id: string,
  ): Promise<IFlashcardDeckLabelStats | null> {
    return await this.labelRepository.getLabelStats(id);
  }

  async getLabelsByDeckId(deckId: string) {
    return await this.labelRepository.getLabelsByDeckId(deckId);
  }

  async getAvailableLabels(userId: string) {
    return await this.labelRepository.getAvailableLabels(userId);
  }
}
