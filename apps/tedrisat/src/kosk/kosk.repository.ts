import { Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { kosks, koskFollowers } from '../database/schema/kosk.schema';
import {
  courses,
  courseMuderris,
  enrollments,
} from '../database/schema/course.schema';
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

  private statsSelect(userId: string) {
    return {
      kosk: kosks,
      courseCount:
        sql<number>`(select count(*) from ${courses} c where c.kosk_id = "kosks"."id")`.mapWith(
          Number,
        ),
      studentCount:
        sql<number>`(select count(distinct e.user_id) from ${enrollments} e join ${courses} c on e.course_id = c.id where c.kosk_id = "kosks"."id")`.mapWith(
          Number,
        ),
      muderrisCount:
        sql<number>`(select count(distinct cm.id) from ${courseMuderris} cm join ${courses} c on cm.course_id = c.id where c.kosk_id = "kosks"."id")`.mapWith(
          Number,
        ),
      followerCount:
        sql<number>`(select count(*) from ${koskFollowers} kf where kf.kosk_id = "kosks"."id")`.mapWith(
          Number,
        ),
      isFollowing:
        sql<boolean>`exists(select 1 from ${koskFollowers} kf where kf.kosk_id = "kosks"."id" and kf.user_id = ${userId})`.mapWith(
          Boolean,
        ),
    };
  }

  private toStats(row: {
    kosk: IKosk;
    courseCount: number;
    studentCount: number;
    muderrisCount: number;
    followerCount: number;
    isFollowing: boolean;
  }): IKoskWithStats {
    return {
      ...row.kosk,
      courseCount: row.courseCount,
      studentCount: row.studentCount,
      muderrisCount: row.muderrisCount,
      followerCount: row.followerCount,
      isFollowing: row.isFollowing,
    };
  }

  async findAll(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<IKoskWithStats[]> {
    const rows = await this.db
      .select(this.statsSelect(userId))
      .from(kosks)
      .orderBy(desc(kosks.featured), desc(kosks.createdAt))
      .limit(limit)
      .offset(offset);
    return rows.map((r) => this.toStats(r));
  }

  async count(): Promise<number> {
    const [row] = await this.db
      .select({ value: sql<number>`count(*)`.mapWith(Number) })
      .from(kosks);
    return row?.value ?? 0;
  }

  async findById(id: string, userId: string): Promise<IKoskWithStats | null> {
    const rows = await this.db
      .select(this.statsSelect(userId))
      .from(kosks)
      .where(eq(kosks.id, id));
    return rows[0] ? this.toStats(rows[0]) : null;
  }

  async findOwnerId(id: string): Promise<string | null> {
    const rows = await this.db
      .select({ ownerId: kosks.ownerId })
      .from(kosks)
      .where(eq(kosks.id, id))
      .limit(1);
    return rows[0]?.ownerId ?? null;
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

  async follow(userId: string, koskId: string): Promise<boolean> {
    await this.db
      .insert(koskFollowers)
      .values({ userId, koskId })
      .onConflictDoNothing();
    return true;
  }

  async unfollow(userId: string, koskId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(koskFollowers)
      .where(
        and(eq(koskFollowers.userId, userId), eq(koskFollowers.koskId, koskId)),
      )
      .returning();
    return deleted.length > 0;
  }
}
