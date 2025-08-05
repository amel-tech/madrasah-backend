import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";

import { plainToClass } from "@nestjs/class-transformer";
import { validate } from "@nestjs/class-validator";

import { CardType } from "../enums/card-type.enum";
import {
    CreateHadeethCardDto,
    CreateVocabCardDto
} from "../dto/create-card.dto";


@Injectable()
export class CardValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!value || typeof value.type === "undefined") {
            throw new BadRequestException("Card type is missing from the request body.");
        }

        let cls_dto;
        switch (value.type) {
            case CardType.VOCABULARY:
                cls_dto = CreateVocabCardDto;
                break;
            case CardType.HADEETH:
                cls_dto = CreateHadeethCardDto;
                break;
            default:
                throw new BadRequestException(`Unsupported card type: ${value.type}`);                
        }

        const instance = plainToClass(cls_dto, value)
        const errors = await validate(instance)

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        return instance;
    }
}