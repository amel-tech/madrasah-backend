import { IsString, MaxLength } from "@nestjs/class-validator"


export class VocabContentDto {
    @IsString()
    @MaxLength(100)
    front!: string

    @IsString()
    @MaxLength(100)
    back!: string
}