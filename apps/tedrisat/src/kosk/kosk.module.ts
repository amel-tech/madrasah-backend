import { Module } from '@nestjs/common';
import { AuthGuardModule } from '@madrasah/common';
import { DatabaseService } from '../database/database.service';
import { KoskController } from './kosk.controller';
import { KoskService } from './kosk.service';
import { KoskRepository } from './kosk.repository';

@Module({
  imports: [AuthGuardModule],
  controllers: [KoskController],
  providers: [KoskService, KoskRepository, DatabaseService],
  exports: [KoskService],
})
export class KoskModule {}
