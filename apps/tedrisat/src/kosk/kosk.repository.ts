import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { kosks } from '../database/schema/kosk.schema';
import { courses } from '../database/schema/course.schema';
import {
  ICreateKosk,
  IKosk,
  IKoskRepository,
  IKoskWithStats,
  IUpdateKosk,
} from './kosk.repository.interface';

@Injectable()
export class KoskRepository implements IKoskRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(): Promise<IKoskWithStats[]> {
    const rows = await this.db
      .select({
        kosk: kosks,
        courseCount: sql<number>`count(${courses.id})`.mapWith(Number),
      })
      .from(kosks)
      .leftJoin(courses, eq(courses.koskId, kosks.id))
      .groupBy(kosks.id);

    return rows.map((r) => ({ ...r.kosk, courseCount: r.courseCount }));
  }

  async findById(id: string): Promise<IKoskWithStats | null> {
    const rows = await this.db
      .select({
        kosk: kosks,
        courseCount: sql<number>`count(${courses.id})`.mapWith(Number),
      })
      .from(kosks)
      .leftJoin(courses, eq(courses.koskId, kosks.id))
      .where(eq(kosks.id, id))
      .groupBy(kosks.id);

    const row = rows[0];
    return row ? { ...row.kosk, courseCount: row.courseCount } : null;
  }

  async create(kosk: ICreateKosk): Promise<IKosk> {
    const [created] = await this.db.insert(kosks).values(kosk).returning();
    return created;
  }

  async update(id: string, updates: IUpdateKosk): Promise<IKosk | null> {
    return this.db
      .update(kosks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kosks.id, id))
      .returning()
      .then((result) => result[0] || null);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(kosks)
      .where(eq(kosks.id, id))
      .returning();
    return deleted.length > 0;
  }
}
