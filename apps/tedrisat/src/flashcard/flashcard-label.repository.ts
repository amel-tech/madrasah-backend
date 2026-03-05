import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  ICreateFlashcardLabel,
  ICreateFlashcardLabeling,
  IFlashcardLabel,
  IFlashcardLabeling,
  IFlashcardLabelRepository,
  IFlashcardLabelStats,
} from './flashcard-label.repository.interface';
import {
  flashcardLabels,
  flashcardLabelings,
  flashcardLabelStats,
} from 'src/database/schema/flashcard-label.schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class FlashcardLabelRepository implements IFlashcardLabelRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async RemoveLabeling(labelingId: string): Promise<boolean> {
    const deleted = await this.databaseService.db
      .delete(flashcardLabelings)
      .where(eq(flashcardLabelings.id, labelingId))
      .returning();
    return deleted.length > 0;
  }

  async getById(labelId: string): Promise<IFlashcardLabel | null> {
    const result = await this.databaseService.db
      .select()
      .from(flashcardLabels)
      .where(eq(flashcardLabels.id, labelId));

    if (result.length === 0) return null;
    return result[0];
  }

  async delete(labelId: string): Promise<boolean> {
    const deleteLabel = await this.databaseService.db
      .delete(flashcardLabels)
      .where(eq(flashcardLabels.id, labelId))
      .returning();
    return deleteLabel.length > 0;
  }

  async createLabel(newLabel: ICreateFlashcardLabel): Promise<IFlashcardLabel> {
    const label = await this.databaseService.db
      .insert(flashcardLabels)
      .values(newLabel)
      .returning();

    return label[0];
  }

  async flashcardLabeling(
    newLabeling: ICreateFlashcardLabeling,
  ): Promise<IFlashcardLabeling> {
    const labelingToInsert = {
      labelId: newLabeling.labelId,
      flashcardId: newLabeling.flashcardId,
      userId: newLabeling.userId,
      createdBy: newLabeling.createdBy,
      privateToUserId: newLabeling.privateToUserId ?? null,
    };

    const [labeling] = await this.databaseService.db
      .insert(flashcardLabelings)
      .values(labelingToInsert)
      .returning();

    return labeling;
  }

  async getLabeling(labelingId: string): Promise<IFlashcardLabeling> {
    const [labeling] = await this.databaseService.db
      .select()
      .from(flashcardLabelings)
      .where(eq(flashcardLabelings.id, labelingId));

    return labeling;
  }

  async createLabelStats(
    newStats: IFlashcardLabelStats,
  ): Promise<IFlashcardLabelStats> {
    const stats = await this.databaseService.db
      .insert(flashcardLabelStats)
      .values(newStats)
      .returning();

    return stats[0];
  }

  async updateLabelStats(labelId: string): Promise<IFlashcardLabelStats> {
    const stats = await this.databaseService.db
      .update(flashcardLabelStats)
      .set({
        usageCount: sql`${flashcardLabelStats.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(flashcardLabelStats.labelId, labelId))
      .returning();

    return stats[0];
  }

  async decrementLabelStats(labelId: string): Promise<void> {
    await this.databaseService.db
      .update(flashcardLabelStats)
      .set({
        usageCount: sql`${flashcardLabelStats.usageCount} - 1`,
      })
      .where(eq(flashcardLabelStats.labelId, labelId));
  }

  async getLabelStats(labelId: string): Promise<IFlashcardLabelStats | null> {
    const stats = await this.databaseService.db
      .select()
      .from(flashcardLabelStats)
      .where(eq(flashcardLabelStats.labelId, labelId));

    return stats.length > 0 ? stats[0] : null;
  }

  async getLabelsByFlashcardId(
    flashcardId: string,
  ): Promise<IFlashcardLabel[]> {
    return await this.databaseService.db
      .select({
        id: flashcardLabels.id,
        title: flashcardLabels.title,
        scope: flashcardLabels.scope,
        userId: flashcardLabels.userId,
        createdBy: flashcardLabels.createdBy,
        createdAt: flashcardLabels.createdAt,
      })
      .from(flashcardLabelings)
      .innerJoin(
        flashcardLabels,
        eq(flashcardLabels.id, flashcardLabelings.labelId),
      )
      .where(eq(flashcardLabelings.flashcardId, flashcardId));
  }

  async getAvailableLabels(userId: string): Promise<IFlashcardLabel[]> {
    return await this.databaseService.db
      .select()
      .from(flashcardLabels)
      .where(
        sql`${flashcardLabels.scope} = 'PUBLIC' OR ${flashcardLabels.userId} = ${userId}`,
      );
  }
}
