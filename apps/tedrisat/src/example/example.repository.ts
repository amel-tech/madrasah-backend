import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import {
  IExampleRepository,
  IExample,
  ICreateExample,
} from './example.interface';
import { examples, NewExample } from '../database/schema/example.schema';

@Injectable()
export class ExampleRepository implements IExampleRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<IExample[]> {
    return this.databaseService.db.select().from(examples);
  }

  async findById(id: number): Promise<IExample | null> {
    return this.databaseService.db
      .select()
      .from(examples)
      .where(eq(examples.id, id))
      .limit(1)
      .then((result) => result[0] || null);
  }

  async create(example: ICreateExample): Promise<IExample> {
    const newExample: NewExample = {
      name: example.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdExample] = await this.databaseService.db
      .insert(examples)
      .values(newExample)
      .returning();

    return createdExample;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(examples)
      .where(eq(examples.id, id))
      .returning();

    return result?.length > 0;
  }
}
