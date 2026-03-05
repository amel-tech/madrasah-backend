import { ApiProperty } from '@nestjs/swagger';
import { Scope } from '../domain/flashcard-label.enum';

export class FlashcardCreateLabelResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: Scope })
  scope!: Scope;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt?: Date;
}

export class FlashcardLabelingResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  labelId!: string;

  @ApiProperty()
  flashcardId!: string;

  @ApiProperty({ nullable: true })
  privateToUserId!: string | null;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class FlashcardLabelResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: Scope })
  scope!: Scope;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class LabelStatsResponse {
  @ApiProperty()
  labelId!: string;

  @ApiProperty()
  usageCount!: number;

  @ApiProperty({ nullable: true })
  lastUsedAt!: Date | null;
}
