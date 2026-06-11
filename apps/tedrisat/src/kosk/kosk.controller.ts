import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthGuard,
  Authz,
  AuthzGuard,
  byParam,
  ENTITIES,
  SCOPES,
} from '@madrasah/common';
import { KoskService } from './kosk.service';
import { CreateKoskDto } from './dto/create-kosk.dto';
import { UpdateKoskDto } from './dto/update-kosk.dto';
import { KoskResponse } from './dto/kosk-response.dto';
import { PaginatedKoskResponse } from './dto/paginated-kosk-response.dto';
import { AuthorizedRequest } from './interfaces/authorized-request.interface';

const MAX_PAGE_SIZE = 50;

@ApiTags('kosks')
@ApiBearerAuth()
@UseGuards(AuthGuard, AuthzGuard)
@Controller('kosks')
export class KoskController {
  constructor(private readonly koskService: KoskService) {}

  @ApiOperation({
    summary: 'Get a paginated list of köşks',
    operationId: 'getAllKosks',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: PaginatedKoskResponse })
  // Self-scoped listing — repository filters by visibility/discovery rules.
  @Get()
  async findAll(
    @Req() request: AuthorizedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ): Promise<PaginatedKoskResponse> {
    const safePage = page < 1 ? 1 : page;
    const safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
    return this.koskService.findAll(request.user.sub, safePage, safeLimit);
  }

  @ApiOperation({
    summary: 'Get a köşk by ID',
    operationId: 'getKoskById',
  })
  @ApiOkResponse({ type: KoskResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.VIEW, byParam(ENTITIES.KOSK))
  @Get(':id')
  async findById(
    @Req() request: AuthorizedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KoskResponse> {
    return this.koskService.findById(id, request.user.sub);
  }

  @ApiOperation({
    summary: 'Create a new köşk (SYSTEM_ADMIN only)',
    description:
      'Only SYSTEM_ADMIN may open new köşks. Pass `ownerId` to designate the user who becomes KOSK_MANAGER; omit to assign to the calling admin.',
    operationId: 'createKosk',
  })
  @ApiCreatedResponse({ type: KoskResponse })
  @ApiForbiddenResponse()
  // CREATE_KOSK is intentionally absent from every matrix row; only
  // SYSTEM_ADMIN bypass passes this guard.
  @Authz(SCOPES.CREATE_KOSK, () => ({ entity: ENTITIES.KOSK, id: 'new' }))
  @Post()
  async create(
    @Req() request: AuthorizedRequest,
    @Body() koskDto: CreateKoskDto,
  ): Promise<KoskResponse> {
    const { ownerId: assignedOwner, ...rest } = koskDto;
    const ownerId = assignedOwner ?? request.user.sub;
    const created = await this.koskService.create({ ownerId, ...rest });
    return this.koskService.findById(created.id, ownerId);
  }

  @ApiOperation({
    summary: 'Update a köşk',
    operationId: 'updateKosk',
  })
  @ApiOkResponse({ type: KoskResponse })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.EDIT, byParam(ENTITIES.KOSK))
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
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Authz(SCOPES.DELETE, byParam(ENTITIES.KOSK))
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
  // Self-scoped: the follow row is keyed by (userId, koskId). The
  // service validates the köşk exists before inserting.
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
