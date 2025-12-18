import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import {
  deckLabelings,
  deckLabels,
  deckLabelsStats,
} from '../database/schema/flashcard-deck-label.schema';
import {
  ICreateFlashcardDeckLabel,
  IFlashcardDeckLabel,
  IFlashcardDeckLabeling,
  IFlashcardDeckLabelRepository,
  IFlashcardDeckLabelStats,
} from './flashcard-deck-label.repository.interface';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class FlashcardDeckLabelRepository
  implements IFlashcardDeckLabelRepository
{
  constructor(private readonly databaseService: DatabaseService) {}
  async getById(tagId: string): Promise<IFlashcardDeckLabel> {
    const [result] = await this.databaseService.db
      .select()
      .from(deckLabels)
      .where(eq(deckLabels.id, tagId));
    return result;
  }

  async create(
    newTag: ICreateFlashcardDeckLabel,
  ): Promise<IFlashcardDeckLabel> {
    const [created] = await this.databaseService.db
      .insert(deckLabels)
      .values(newTag)
      .returning();
    return created;
  }
  async delete(labelId: string): Promise<boolean> {
    const deleted = await this.databaseService.db
      .delete(deckLabels)
      .where(eq(deckLabels.id, labelId))
      .returning();
    return deleted.length > 0;
  }
  async deckLabeling(
    newLabeling: IFlashcardDeckLabeling,
  ): Promise<IFlashcardDeckLabeling> {
    const labelingToInsert = {
      labelId: newLabeling.labelId,
      deckId: newLabeling.deckId,
      createdBy: newLabeling.createdBy,
      privateToUserId: newLabeling.privateToUserId ?? null,
    };

    const [deckLabeling] = await this.databaseService.db
      .insert(deckLabelings)
      .values(labelingToInsert)
      .returning();
    return {
      labelId: deckLabeling.labelId,
      privateToUserId: deckLabeling.privateToUserId,
      deckId: deckLabeling.deckId,
      createdBy: deckLabeling.createdBy,
    };
  }
  async createLabelStats(
    useLabel: IFlashcardDeckLabelStats,
  ): Promise<IFlashcardDeckLabelStats> {
    const cretedStats = await this.databaseService.db
      .insert(deckLabelsStats)
      .values(useLabel)
      .returning();
    return {
      labelId: cretedStats[0].labelId,
      usageCount: cretedStats[0].usageCount,
      lastUsedAt: cretedStats[0].lastUsedAt,
    };
  }
  async updateLabelStats(labelId: string): Promise<IFlashcardDeckLabelStats> {
    const cretedStats = await this.databaseService.db
      .update(deckLabelsStats)
      .set({
        usageCount: sql`${deckLabelsStats.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(deckLabelsStats.labelId, labelId))
      .returning();
    return {
      labelId: cretedStats[0].labelId,
      usageCount: cretedStats[0].usageCount,
      lastUsedAt: cretedStats[0].lastUsedAt,
    };
  }
  async getLabelStats(labelId: string): Promise<IFlashcardDeckLabelStats> {
    const stats = await this.databaseService.db
      .select()
      .from(deckLabelsStats)
      .where(eq(deckLabelsStats.labelId, labelId));
    return {
      labelId: stats[0].labelId,
      usageCount: stats[0].usageCount,
      lastUsedAt: stats[0].lastUsedAt,
    };
  }
}
