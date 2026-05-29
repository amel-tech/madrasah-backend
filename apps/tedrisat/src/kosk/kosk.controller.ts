import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@madrasah/common';
import { KoskService } from './kosk.service';
import { CreateKoskDto } from './dto/create-kosk.dto';
import { UpdateKoskDto } from './dto/update-kosk.dto';
import { KoskResponse } from './dto/kosk-response.dto';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';

@ApiTags('kosks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('kosks')
export class KoskController {
  constructor(private readonly koskService: KoskService) {}

  @ApiOperation({
    summary: 'Get all köşks',
    operationId: 'getAllKosks',
  })
  @ApiOkResponse({ type: KoskResponse, isArray: true })
  @Get()
  async findAll(): Promise<KoskResponse[]> {
    return this.koskService.findAll();
  }

  @ApiOperation({
    summary: 'Get a köşk by ID',
    operationId: 'getKoskById',
  })
  @ApiOkResponse({ type: KoskResponse })
  @ApiNotFoundResponse()
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KoskResponse> {
    return this.koskService.findById(id);
  }

  @ApiOperation({
    summary: 'Create a new köşk',
    operationId: 'createKosk',
  })
  @ApiCreatedResponse({ type: KoskResponse })
  @Post()
  async create(
    @Req() request: AuthorizedRequest,
    @Body() koskDto: CreateKoskDto,
  ): Promise<KoskResponse> {
    const ownerId = request.user.sub;
    return this.koskService.create({ ownerId, ...koskDto });
  }

  @ApiOperation({
    summary: 'Update a köşk',
    operationId: 'updateKosk',
  })
  @ApiOkResponse({ type: KoskResponse })
  @ApiNotFoundResponse()
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() koskDto: UpdateKoskDto,
  ): Promise<KoskResponse> {
    return this.koskService.update(id, koskDto);
  }

  @ApiOperation({
    summary: 'Delete a köşk',
    operationId: 'deleteKosk',
  })
  @ApiOkResponse({ type: Boolean })
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.koskService.delete(id);
  }
}
