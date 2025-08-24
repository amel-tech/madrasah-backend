import { Injectable, PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import { plainToClass, ClassConstructor } from '@nestjs/class-transformer';
import { validate } from '@nestjs/class-validator';

import { FlashcardType } from '../domain/flashcard-type.enum';
import {
  CreateHadeethCardDto,
  CreateVocabCardDto,
  CreateFlashcardDto,
} from '../dto/create-flashcard.dto';

@Injectable()
export class FlashcardValidationPipe implements PipeTransform<any> {
  async transform(value: Record<string, any>) {
    if (!value || typeof value.type === 'undefined') {
      throw new BadRequestException(
        'Card type is missing from the request body.',
      );
    }

    let cls_dto: ClassConstructor<CreateFlashcardDto>;
    switch (value.type) {
      case FlashcardType.VOCABULARY:
        cls_dto = CreateVocabCardDto;
        break;
      case FlashcardType.HADEETH:
        cls_dto = CreateHadeethCardDto;
        break;
      default:
        throw new BadRequestException(`Unsupported card type: ${value.type}`);
    }

    const instance = plainToClass(cls_dto, value);
    const errors = await validate(instance); // needs more informative error handling

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return instance;
  }
}
