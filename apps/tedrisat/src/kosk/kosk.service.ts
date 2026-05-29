import { Injectable } from '@nestjs/common';
import { KoskRepository } from './kosk.repository';
import {
  ICreateKosk,
  IKosk,
  IKoskWithStats,
  IUpdateKosk,
} from './kosk.repository.interface';
import { KoskNotFoundError } from './errors/kosk-not-found.error';

@Injectable()
export class KoskService {
  constructor(private readonly koskRepo: KoskRepository) {}

  async findAll(userId: string): Promise<IKoskWithStats[]> {
    return this.koskRepo.findAll(userId);
  }

  async findById(id: string, userId: string): Promise<IKoskWithStats> {
    const kosk = await this.koskRepo.findById(id, userId);
    if (!kosk) {
      throw new KoskNotFoundError(id);
    }
    return kosk;
  }

  async create(newKosk: ICreateKosk): Promise<IKosk> {
    return this.koskRepo.create(newKosk);
  }

  async update(id: string, updates: IUpdateKosk): Promise<IKosk> {
    const updated = await this.koskRepo.update(id, updates);
    if (!updated) {
      throw new KoskNotFoundError(id);
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
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
