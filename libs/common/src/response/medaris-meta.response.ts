import { ApiPropertyOptional } from "@nestjs/swagger";
import { MedarisMetaPaginationResponse } from "./medaris-meta-pagination.response";

export class MedarisMetaResponse {
    @ApiPropertyOptional()
    pagination?: MedarisMetaPaginationResponse

    [key: string]: unknown
}