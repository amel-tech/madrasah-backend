import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({
  description: 'Pagination metadata returned under the meta.pagination field in paginated API responses.'
})
export class MetaPaginationResponse {
    @ApiProperty({
        minimum: 0,
        description: 'Number of items on the current page'
    })
    itemCount!: number

    @ApiProperty({
        minimum: 1,
        description: 'Current page number (starting from 1)'
    })
    currentPage!: number

    @ApiProperty({
        minimum: 0,
        description: 'Total number of available items'
    })
    totalItems!: number

    @ApiProperty({
        minimum: 0,
        description: 'Maximum number of items per page'
    })
    itemsPerPage!: number

    @ApiProperty({
        minimum: 0,
        description: 'Total number of pages available'
    })
    totalPages!: number
}