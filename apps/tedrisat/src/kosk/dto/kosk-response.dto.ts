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

  @ApiPropertyOptional({ type: String, example: 'Tefsir & Hadis' })
  field!: string | null;

  @ApiPropertyOptional({ type: String, example: 'ALL' })
  level!: string | null;

  @ApiProperty({ type: [String], example: ['Tefsir', 'Hadis'] })
  tags!: string[];

  @ApiProperty({ example: false })
  verified!: boolean;

  @ApiProperty({ example: false })
  featured!: boolean;

  @ApiProperty({ example: 4.8 })
  rating!: number;

  @ApiProperty({ example: 132 })
  ratingCount!: number;

  @ApiProperty({
    description: 'Courses published under this köşk',
    example: 14,
  })
  courseCount!: number;

  @ApiProperty({ description: 'Distinct enrolled talebe', example: 482 })
  studentCount!: number;

  @ApiProperty({ description: 'Distinct müderris', example: 6 })
  muderrisCount!: number;

  @ApiProperty({ example: 240 })
  followerCount!: number;

  @ApiProperty({ description: 'Whether the current talebe follows this köşk' })
  isFollowing!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
