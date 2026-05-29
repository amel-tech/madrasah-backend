import { Injectable } from '@nestjs/common';
import { KoskRepository } from './kosk.repository';
import {
  ICreateKosk,
  IKosk,
  IKoskWithStats,
  IPaginatedKosks,
  IUpdateKosk,
} from './kosk.repository.interface';
import { KoskNotFoundError } from './errors/kosk-not-found.error';
import { KoskForbiddenError } from './errors/kosk-forbidden.error';

@Injectable()
export class KoskService {
  constructor(private readonly koskRepo: KoskRepository) {}

  async findAll(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaginatedKosks> {
    const offset = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.koskRepo.findAll(userId, limit, offset),
      this.koskRepo.count(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string, userId: string): Promise<IKoskWithStats> {
    const kosk = await this.koskRepo.findById(id, userId);
    if (!kosk) {
      throw new KoskNotFoundError(id);
    }
    return kosk;
  }

  /** Ensures the köşk exists and is owned by `userId`, else throws. */
  async assertOwner(koskId: string, userId: string): Promise<void> {
    const ownerId = await this.koskRepo.findOwnerId(koskId);
    if (ownerId === null) {
      throw new KoskNotFoundError(koskId);
    }
    if (ownerId !== userId) {
      throw new KoskForbiddenError();
    }
  }

  async create(newKosk: ICreateKosk): Promise<IKosk> {
    return this.koskRepo.create(newKosk);
  }

  async update(
    id: string,
    userId: string,
    updates: IUpdateKosk,
  ): Promise<IKosk> {
    await this.assertOwner(id, userId);
    const updated = await this.koskRepo.update(id, updates);
    if (!updated) {
      throw new KoskNotFoundError(id);
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.assertOwner(id, userId);
    return this.koskRepo.delete(id);
  }

  async follow(userId: string, koskId: string): Promise<boolean> {
    await this.findById(koskId, userId); // throws if köşk is missing
    return this.koskRepo.follow(userId, koskId);
  }

  async unfollow(userId: string, koskId: string): Promise<boolean> {
    return this.koskRepo.unfollow(userId, koskId);
  }
}
