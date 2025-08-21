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
import { BaseResponseDto } from '@madrasah/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { ExampleResponseDto } from './dto/example-response.dto';
import { ExampleService } from './example.service';

@ApiTags('Examples')
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all examples' })
  @ApiResponse({ status: 200, description: 'List of examples' })
  @ApiResponse({
    status: 200,
    description: 'List of examples',
    type: BaseResponseDto<ExampleResponseDto[]>,
  })
  async getAllExamples(): Promise<BaseResponseDto<ExampleResponseDto[]>> {
    const examples = await this.exampleService.getAllExamples();
    return BaseResponseDto.success(examples);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
  @ApiResponse({
    status: 200,
    description: 'Example found',
    type: BaseResponseDto<ExampleResponseDto>,
  })
  @ApiNotFoundResponse({ description: 'Example not found' })
  async getExampleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponseDto<ExampleResponseDto>> {
    const example = await this.exampleService.getExampleById(id);
    return BaseResponseDto.success(example);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new example' })
  @ApiResponse({
    status: 201,
    description: 'Example created successfully',
    type: BaseResponseDto<ExampleResponseDto>,
  })
  async createExample(
    @Body() createExampleDto: CreateExampleDto,
  ): Promise<BaseResponseDto<ExampleResponseDto>> {
    const example = await this.exampleService.createExample(createExampleDto);
    return BaseResponseDto.success(example);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete example by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
  @ApiResponse({
    status: 200,
    description: 'Example deleted successfully',
    type: BaseResponseDto<boolean>,
  })
  async deleteExample(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponseDto<boolean>> {
    const result = await this.exampleService.deleteExample(id);
    return BaseResponseDto.success(result);
  }
}
