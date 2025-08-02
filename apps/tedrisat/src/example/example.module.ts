import { Module } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ExampleRepository } from './example.repository';
import { ExampleController } from './example.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleRepository],
  exports: [ExampleService],
})
export class ExampleModule {}
