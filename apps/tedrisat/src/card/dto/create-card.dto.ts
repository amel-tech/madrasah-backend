import { IsDefined, IsOptional } from "@nestjs/class-validator"
import { IsBoolean, IsEnum, IsUrl } from "@nestjs/class-validator"
import { MaxLength, ValidateNested } from "@nestjs/class-validator"

import { CardType } from "../enums/card-type.enum"
import { Type } from "@nestjs/class-transformer"
import { VocabContentDto } from "./content/vocab-content.dto"
import { HadeethContentDto } from "./content/hadeeth-content.dto"


abstract class CreateCardBaseDto {
    @IsEnum(CardType)
    type: CardType

    @IsBoolean()
    is_public: boolean

    @IsOptional()
    @IsUrl()
    @MaxLength(100)
    image_source?: string
}


export class CreateVocabCardDto extends CreateCardBaseDto {
    @IsDefined()
    @ValidateNested()
    @Type(() => VocabContentDto)
    content: VocabContentDto
}


export class CreateHadeethCardDto extends CreateCardBaseDto {
    @IsDefined()
    @ValidateNested()
    @Type(() => HadeethContentDto)
    content: HadeethContentDto
}


export type CreateCardDto = 
    | CreateVocabCardDto
    | CreateHadeethCardDto;