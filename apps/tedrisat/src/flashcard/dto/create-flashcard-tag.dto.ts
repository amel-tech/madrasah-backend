import { IsString, MaxLength, MinLength } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFlashcardTagDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;
}
