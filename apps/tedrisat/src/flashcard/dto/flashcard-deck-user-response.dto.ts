import { ApiProperty } from '@nestjs/swagger';

export class FlashcardDeckUserResponse {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  deckId!: string;

  @ApiProperty()
  createdAt!: Date;
}
