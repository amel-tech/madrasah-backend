import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KoskResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty({ example: 'Süleymaniye Köşkü' })
  name!: string;

  @ApiPropertyOptional({ type: String, example: '@suleymaniye' })
  handle!: string | null;

  @ApiPropertyOptional({ type: String })
  description!: string | null;

  @ApiProperty({ example: 215 })
  coverHue!: number;

  @ApiProperty({ example: true })
  isPrivate!: boolean;

  @ApiPropertyOptional({
    description: 'Number of courses published under this köşk',
    example: 14,
  })
  courseCount?: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
