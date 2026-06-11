import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MedarisError } from '../error/errors/base/medaris.error';
import { AUTHZ_KEY, AuthzMeta } from './authz.decorator';
import { AuthzService } from './authz.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import {
  AuthzForbiddenError,
  AuthzMissingUserError,
  AuthzResolverError,
} from './exceptions/exceptions';
import { ResourceRef } from './scopes';

/**
 * Enforces the `@Authz` contract on a route. Must be wired *after*
 * `AuthGuard` so `request.user` is set:
 *
 *   @UseGuards(AuthGuard, AuthzGuard)
 *   @Authz(SCOPES.EDIT, byParam(ENTITIES.COURSE))
 *   update(...) { ... }
 *
 * NestJS evaluates `@UseGuards` guards in declaration order, so
 * AuthGuard runs first, populates `request.user`, then AuthzGuard reads
 * the metadata and decides allow/deny.
 *
 * **Permissive fall-through (deliberate, transitional).** Routes
 * without `@Authz` metadata pass through unchanged. Once all in-scope
 * endpoints are annotated, flip this to deny-by-default with an
 * explicit `@AuthzPublic` opt-out.
 */
@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authz: AuthzService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.get<AuthzMeta | undefined>(
      AUTHZ_KEY,
      ctx.getHandler(),
    );
    if (!meta) return true;

    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      throw new AuthzMissingUserError();
    }

    const resource = await this.resolveResource(meta, request);

    const allowed = await this.authz.can(user, resource, meta.scope);
    if (!allowed) {
      throw new AuthzForbiddenError(undefined, {
        userId: user.sub,
        entity: resource.entity,
        resourceId: resource.id,
        scope: meta.scope,
      });
    }
    return true;
  }

  /**
   * Run the resolver and validate the result. Domain errors raised by
   * the resolver (HttpException, MedarisError subclasses) propagate
   * as-is so a `NotFoundException` thrown from inside a custom resolver
   * surfaces as 404, not as a generic 500. Everything else is treated
   * as a server-side configuration bug.
   */
  private async resolveResource(
    meta: AuthzMeta,
    request: Request,
  ): Promise<ResourceRef> {
    let resource: ResourceRef;
    try {
      resource = await meta.resolve(request, this.moduleRef);
    } catch (error) {
      if (error instanceof HttpException || error instanceof MedarisError) {
        throw error;
      }
      throw new AuthzResolverError(
        `@Authz(${meta.scope}) resolver threw: ${this.describe(error)}`,
        { scope: meta.scope, cause: this.describe(error) },
      );
    }

    if (
      !resource ||
      typeof resource.id !== 'string' ||
      resource.id.length === 0
    ) {
      throw new AuthzResolverError(
        `@Authz(${meta.scope}) resolver returned an empty resource ID. Check that the decorator reads the correct request param name.`,
        {
          scope: meta.scope,
          entity: resource?.entity,
          returnedIdType: typeof resource?.id,
        },
      );
    }
    return resource;
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
