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
  async findAll(@Req() request: AuthorizedRequest): Promise<KoskResponse[]> {
    return this.koskService.findAll(request.user.sub);
  }

  @ApiOperation({
    summary: 'Get a köşk by ID',
    operationId: 'getKoskById',
  })
  @ApiOkResponse({ type: KoskResponse })
  @ApiNotFoundResponse()
  @Get(':id')
  async findById(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KoskResponse> {
    return this.koskService.findById(id, request.user.sub);
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
    const created = await this.koskService.create({ ownerId, ...koskDto });
    return this.koskService.findById(created.id, ownerId);
  }

  @ApiOperation({
    summary: 'Update a köşk',
    operationId: 'updateKosk',
  })
  @ApiOkResponse({ type: KoskResponse })
  @ApiNotFoundResponse()
  @Patch(':id')
  async update(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() koskDto: UpdateKoskDto,
  ): Promise<KoskResponse> {
    await this.koskService.update(id, koskDto);
    return this.koskService.findById(id, request.user.sub);
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

  @ApiOperation({
    summary: 'Follow a köşk as the current talebe',
    operationId: 'followKosk',
  })
  @ApiCreatedResponse({ type: Boolean })
  @ApiNotFoundResponse()
  @Post(':id/follow')
  async follow(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.koskService.follow(request.user.sub, id);
  }

  @ApiOperation({
    summary: 'Unfollow a köşk',
    operationId: 'unfollowKosk',
  })
  @ApiOkResponse({ type: Boolean })
  @Delete(':id/follow')
  async unfollow(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.koskService.unfollow(request.user.sub, id);
  }
}
