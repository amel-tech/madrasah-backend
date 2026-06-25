import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  AUTHZ_KEY,
  AuthzForbiddenError,
  AuthzGuard,
  AuthzMeta,
  AuthzMissingUserError,
  AuthzResolverError,
  AuthzService,
  ENTITIES,
  ROLES,
  RoleResolver,
  SCOPES,
} from '@madrasah/common';

const buildContext = (
  request: Record<string, unknown>,
): { ctx: ExecutionContext; handler: () => void } => {
  const handler = function handler() {};
  const ctx = {
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { ctx, handler };
};

const reflectorReturning = (meta?: AuthzMeta): Reflector =>
  ({ get: () => meta }) as unknown as Reflector;

const fakeRoleResolver = (role: ReturnType<RoleResolver['resolve']>): RoleResolver => ({
  resolve: jest.fn().mockResolvedValue(role),
});

const moduleRefStub = {} as ModuleRef;

describe('AuthzGuard', () => {
  it('passes through when no @Authz metadata is present', async () => {
    const guard = new AuthzGuard(
      reflectorReturning(),
      new AuthzService(fakeRoleResolver(null)),
      moduleRefStub,
    );
    const { ctx } = buildContext({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws AuthzMissingUserError when metadata is set but user is absent', async () => {
    const meta: AuthzMeta = {
      scope: SCOPES.EDIT,
      resolve: () => ({ entity: ENTITIES.COURSE, id: 'c-1' }),
    };
    const guard = new AuthzGuard(
      reflectorReturning(meta),
      new AuthzService(fakeRoleResolver(null)),
      moduleRefStub,
    );
    const { ctx } = buildContext({ params: { id: 'c-1' } });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      AuthzMissingUserError,
    );
  });

  it('allows when AuthzService.can resolves true', async () => {
    const meta: AuthzMeta = {
      scope: SCOPES.EDIT,
      resolve: () => ({ entity: ENTITIES.COURSE, id: 'c-1' }),
    };
    const guard = new AuthzGuard(
      reflectorReturning(meta),
      new AuthzService(fakeRoleResolver(ROLES.MUDERRIS)),
      moduleRefStub,
    );
    const { ctx } = buildContext({ user: { sub: 'u-1' } });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws AuthzForbiddenError with structured context when denied', async () => {
    const meta: AuthzMeta = {
      scope: SCOPES.ASSIGN_MUDERRIS,
      resolve: () => ({ entity: ENTITIES.COURSE, id: 'c-1' }),
    };
    const guard = new AuthzGuard(
      reflectorReturning(meta),
      new AuthzService(fakeRoleResolver(ROLES.MUDERRIS)),
      moduleRefStub,
    );
    const { ctx } = buildContext({ user: { sub: 'u-1' } });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      name: 'AuthzForbiddenError',
      context: {
        userId: 'u-1',
        entity: 'course',
        resourceId: 'c-1',
        scope: 'assign_muderris',
      },
    });
  });

  it('awaits async resolvers and passes ModuleRef into them', async () => {
    const fakeMod = { tag: 'mod-stub' } as unknown as ModuleRef;
    let observedMod: unknown;
    const meta: AuthzMeta = {
      scope: SCOPES.VIEW,
      resolve: async (_req, mod) => {
        observedMod = mod;
        return { entity: ENTITIES.FLASHCARD_DECK, id: 'd-1' };
      },
    };
    const guard = new AuthzGuard(
      reflectorReturning(meta),
      new AuthzService(fakeRoleResolver(ROLES.PUBLIC)), // explicit PUBLIC for view ✓ on flashcard-deck
      fakeMod,
    );
    const { ctx } = buildContext({ user: { sub: 'u-1' } });
    await guard.canActivate(ctx);
    expect(observedMod).toBe(fakeMod);
  });

  describe('resolver failure modes', () => {
    it('wraps unknown errors in AuthzResolverError (500)', async () => {
      const meta: AuthzMeta = {
        scope: SCOPES.VIEW,
        resolve: () => {
          throw new Error('boom');
        },
      };
      const guard = new AuthzGuard(
        reflectorReturning(meta),
        new AuthzService(fakeRoleResolver(null)),
        moduleRefStub,
      );
      const { ctx } = buildContext({ user: { sub: 'u-1' } });
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        AuthzResolverError,
      );
    });

    it('lets HttpException propagate (so 404 stays 404)', async () => {
      const meta: AuthzMeta = {
        scope: SCOPES.VIEW,
        resolve: () => {
          throw new NotFoundException('missing');
        },
      };
      const guard = new AuthzGuard(
        reflectorReturning(meta),
        new AuthzService(fakeRoleResolver(null)),
        moduleRefStub,
      );
      const { ctx } = buildContext({ user: { sub: 'u-1' } });
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects empty resource IDs as a configuration error', async () => {
      const meta: AuthzMeta = {
        scope: SCOPES.VIEW,
        resolve: () => ({ entity: ENTITIES.COURSE, id: '' }),
      };
      const guard = new AuthzGuard(
        reflectorReturning(meta),
        new AuthzService(fakeRoleResolver(null)),
        moduleRefStub,
      );
      const { ctx } = buildContext({ user: { sub: 'u-1' } });
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        AuthzResolverError,
      );
    });
  });

  it('writes metadata under AUTHZ_KEY (smoke test)', () => {
    expect(AUTHZ_KEY).toBe('authz');
  });
});
