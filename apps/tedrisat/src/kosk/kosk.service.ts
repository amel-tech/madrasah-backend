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

  async findAll(): Promise<IKoskWithStats[]> {
    return this.koskRepo.findAll();
  }

  async findById(id: string): Promise<IKoskWithStats> {
    const kosk = await this.koskRepo.findById(id);
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
}
