import { ApiProperty } from '@nestjs/swagger';
import { KoskResponse } from './kosk-response.dto';

export class PaginatedKoskResponse {
  @ApiProperty({ type: KoskResponse, isArray: true })
  items!: KoskResponse[];

  @ApiProperty({ description: 'Total number of köşks', example: 38 })
  total!: number;

  @ApiProperty({ description: 'Current page (1-based)', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Items per page', example: 12 })
  limit!: number;
}
