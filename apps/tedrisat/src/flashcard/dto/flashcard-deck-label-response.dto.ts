import { ApiProperty } from '@nestjs/swagger';
import { Scope } from '../domain/flashcard-label.enum';

export class FlashcardDeckCreateLabelResponse {
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

export class FlashcardDeckLabelingResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  labelId!: string;

  @ApiProperty()
  deckId!: string;

  @ApiProperty({ nullable: true })
  privateToUserId!: string | null;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class FlashcardDeckLabelResponse {
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

export class DeckLabelStatsResponse {
  @ApiProperty()
  labelId!: string;

  @ApiProperty()
  usageCount!: number;

  @ApiProperty({ nullable: true })
  lastUsedAt!: Date | null;
}
