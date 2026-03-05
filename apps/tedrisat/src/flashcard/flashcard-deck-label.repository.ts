import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import {
  deckLabelings,
  deckLabels,
  deckLabelsStats,
} from '../database/schema/flashcard-deck-label.schema';
import {
  ICreateFlashcardDeckLabel,
  ICreateFlashcardDeckLabeling,
  IFlashcardDeckLabel,
  IFlashcardDeckLabeling,
  IFlashcardDeckLabelRepository,
  IFlashcardDeckLabelStats,
} from './flashcard-deck-label.repository.interface';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FlashcardDeckLabelRepository
  implements IFlashcardDeckLabelRepository
{
  constructor(private readonly databaseService: DatabaseService) {}

  async RemoveDeckLabeling(labelingId: string): Promise<boolean> {
    const deleted = await this.databaseService.db
      .delete(deckLabelings)
      .where(eq(deckLabelings.id, labelingId))
      .returning();
    return deleted.length > 0;
  }

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
    newLabeling: ICreateFlashcardDeckLabeling,
  ): Promise<IFlashcardDeckLabeling> {
    const labelingToInsert = {
      labelId: newLabeling.labelId,
      deckId: newLabeling.deckId,
      userId: newLabeling.userId,
      createdBy: newLabeling.createdBy,
      privateToUserId: newLabeling.privateToUserId ?? null,
    };

    const [deckLabeling] = await this.databaseService.db
      .insert(deckLabelings)
      .values(labelingToInsert)
      .returning();
    return deckLabeling;
  }

  async getLabeling(labelingId: string): Promise<IFlashcardDeckLabeling> {
    const [labeling] = await this.databaseService.db
      .select()
      .from(deckLabelings)
      .where(eq(deckLabelings.id, labelingId));
    return labeling;
  }

  async createLabelStats(
    useLabel: IFlashcardDeckLabelStats,
  ): Promise<IFlashcardDeckLabelStats> {
    const created = await this.databaseService.db
      .insert(deckLabelsStats)
      .values(useLabel)
      .returning();
    return created[0];
  }

  async updateLabelStats(labelId: string): Promise<IFlashcardDeckLabelStats> {
    const updated = await this.databaseService.db
      .update(deckLabelsStats)
      .set({
        usageCount: sql`${deckLabelsStats.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(deckLabelsStats.labelId, labelId))
      .returning();
    return updated[0];
  }

  async decrementLabelStats(labelId: string): Promise<void> {
    await this.databaseService.db
      .update(deckLabelsStats)
      .set({
        usageCount: sql`${deckLabelsStats.usageCount} - 1`,
      })
      .where(eq(deckLabelsStats.labelId, labelId));
  }

  async getLabelStats(
    labelId: string,
  ): Promise<IFlashcardDeckLabelStats | null> {
    const stats = await this.databaseService.db
      .select()
      .from(deckLabelsStats)
      .where(eq(deckLabelsStats.labelId, labelId));

    if (stats.length === 0) return null;
    return stats[0];
  }

  async getLabelsByDeckId(deckId: string): Promise<IFlashcardDeckLabel[]> {
    return await this.databaseService.db
      .select({
        id: deckLabels.id,
        title: deckLabels.title,
        createdAt: deckLabels.createdAt,
        userId: deckLabels.userId,
        createdBy: deckLabels.createdBy,
        scope: deckLabels.scope,
      })
      .from(deckLabelings)
      .innerJoin(deckLabels, eq(deckLabels.id, deckLabelings.labelId))
      .where(eq(deckLabelings.deckId, deckId));
  }

  async getAvailableLabels(userId: string): Promise<IFlashcardDeckLabel[]> {
    return await this.databaseService.db
      .select()
      .from(deckLabels)
      .where(
        sql`${deckLabels.scope} = 'PUBLIC' OR ${deckLabels.userId} = ${userId}`,
      );
  }
}
