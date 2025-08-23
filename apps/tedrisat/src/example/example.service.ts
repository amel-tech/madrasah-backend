import { Injectable } from '@nestjs/common';
import { IExample } from './example.interface';
import { ExampleRepository } from './example.repository';
import { CreateExampleDto } from './dto/create-example.dto';
import { ExampleNotFoundError } from './errors/example-not-found.error';

@Injectable()
export class ExampleService {
  constructor(private readonly exampleRepository: ExampleRepository) {}

  async getAllExamples(): Promise<IExample[]> {
    return this.exampleRepository.findAll();
  }

  async getExampleById(id: number): Promise<IExample> {
    const example = await this.exampleRepository.findById(id);
    if (!example) {
      throw new ExampleNotFoundError(`Example with id ${id} not found`, { id });
    }
    return example;
  }

  async createExample(exampleDto: CreateExampleDto): Promise<IExample> {
    return this.exampleRepository.create(exampleDto);
  }

  async deleteExample(id: number): Promise<boolean> {
    return this.exampleRepository.delete(id);
  }
}
