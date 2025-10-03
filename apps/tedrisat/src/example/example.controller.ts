import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MedarisResponse } from '@madrasah/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { ExampleResponseDto } from './dto/example-response.dto';
import { ExampleService } from './example.service';

@ApiTags('Examples')
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all examples',
    description:
      'Retrieves a complete list of all available examples in the system',
    operationId: 'getAllExamples',
  })
  @ApiResponse({ status: 200, description: 'List of examples' })
  @ApiResponse({
    status: 200,
    description: 'List of examples',
    type: MedarisResponse<ExampleResponseDto[]>,
  })
  async getAllExamples(): Promise<MedarisResponse<ExampleResponseDto[]>> {
    const examples = await this.exampleService.getAllExamples();
    return MedarisResponse.success(examples);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get example by ID',
    description: 'Retrieves a specific example by its unique identifier',
    operationId: 'getExampleById',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
  @ApiResponse({
    status: 200,
    description: 'Example found',
    type: MedarisResponse<ExampleResponseDto>,
  })
  @ApiNotFoundResponse({ description: 'Example not found' })
  async getExampleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MedarisResponse<ExampleResponseDto>> {
    const example = await this.exampleService.getExampleById(id);
    return MedarisResponse.success(example);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new example',
    description:
      'Creates a new example with the provided data and returns the created example',
    operationId: 'createExample',
  })
  @ApiResponse({
    status: 201,
    description: 'Example created successfully',
    type: MedarisResponse<ExampleResponseDto>,
  })
  async createExample(
    @Body() createExampleDto: CreateExampleDto,
  ): Promise<MedarisResponse<ExampleResponseDto>> {
    const example = await this.exampleService.createExample(createExampleDto);
    return MedarisResponse.success(example);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete example by ID',
    description:
      'Permanently deletes an example by its ID. This action cannot be undone.',
    operationId: 'deleteExample',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
  @ApiResponse({
    status: 200,
    description: 'Example deleted successfully',
    type: MedarisResponse<boolean>,
  })
  async deleteExample(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MedarisResponse<boolean>> {
    const result = await this.exampleService.deleteExample(id);
    return MedarisResponse.success(result);
  }
}
