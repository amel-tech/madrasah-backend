// excel.module.ts

import { Global, Module } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Global()
@Module({
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}