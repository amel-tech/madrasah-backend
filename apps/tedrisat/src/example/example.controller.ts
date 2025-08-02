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
import { CreateExampleDto } from './dto/create-example.dto';
import { ExampleResponseDto } from './dto/example-response.dto';
import { ExampleService } from './example.service';
import { IExample } from './example.interface';

@ApiTags('Examples')
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all examples' })
  @ApiResponse({ status: 200, description: 'List of examples' })
  async getAllExamples(): Promise<ExampleResponseDto[]> {
    return this.exampleService.getAllExamples();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
  @ApiNotFoundResponse({ description: 'Example not found' })
  async getExampleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExampleResponseDto> {
    return this.exampleService.getExampleById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new example' })
  async createExample(
    @Body() createExampleDto: CreateExampleDto,
  ): Promise<IExample> {
    return this.exampleService.createExample(createExampleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete example by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Example ID' })
  async deleteExample(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.exampleService.deleteExample(id);
  }
}
