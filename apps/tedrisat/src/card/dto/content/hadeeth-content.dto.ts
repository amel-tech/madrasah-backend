import { IsArray, IsInt, IsString, MaxLength } from "@nestjs/class-validator";


export class HadeethContentDto {
    @IsArray()
    @IsString({ each: true })
    @MaxLength(30, { each: true })
    "narrator_chain": string[]

    @IsString()
    @MaxLength(500)
    "narrator_chain_verbatim": string

    @IsString()
    @MaxLength(2000)
    "narration": string

    @IsArray()
    @IsInt({ each: true })
    "default_mask": number[]
}