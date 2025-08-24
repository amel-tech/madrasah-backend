import { IsDefined, IsOptional } from '@nestjs/class-validator';
import { IsBoolean, IsEnum, IsUrl } from '@nestjs/class-validator';
import { MaxLength, ValidateNested } from '@nestjs/class-validator';

import { FlashcardType } from '../domain/flashcard-type.enum';
import { Type } from '@nestjs/class-transformer';
import { VocabContentDto } from './content/flashcard-vocab-content.dto';
import { HadeethContentDto } from './content/flashcard-hadeeth-content.dto';

abstract class CreateFlashcardBaseDto {
  @IsEnum(FlashcardType)
  type!: FlashcardType;

  @IsBoolean()
  is_public!: boolean;

  @IsOptional()
  @IsUrl()
  @MaxLength(100)
  image_source?: string;
}

export class CreateVocabCardDto extends CreateFlashcardBaseDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => VocabContentDto)
  content!: VocabContentDto;
}

export class CreateHadeethCardDto extends CreateFlashcardBaseDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => HadeethContentDto)
  content!: HadeethContentDto;
}

export type CreateFlashcardDto = CreateVocabCardDto | CreateHadeethCardDto;
