import {
  AuthenticatedUser,
  AuthzService,
  ENTITIES,
  ResourceRef,
  Role,
  ROLES,
  RoleResolver,
  SCOPES,
} from '@madrasah/common';

const resolverReturning = (role: Role | null): RoleResolver => ({
  resolve: jest.fn().mockResolvedValue(role),
});

const user = (sub = 'u', realmRoles: string[] = []): AuthenticatedUser => ({
  sub,
  realm_access: { roles: realmRoles },
});

describe('AuthzService.can', () => {
  describe('SYSTEM_ADMIN realm-role bypass', () => {
    it('allows any scope on any resource regardless of resolver result', async () => {
      const resolver = resolverReturning(null);
      const svc = new AuthzService(resolver);
      const admin = user('admin', ['SYSTEM_ADMIN']);
      const resource: ResourceRef = { entity: ENTITIES.COURSE, id: 'c-1' };
      await expect(svc.can(admin, resource, SCOPES.DELETE)).resolves.toBe(true);
      // resolver is never consulted because the bypass short-circuits
      expect(resolver.resolve).not.toHaveBeenCalled();
    });

    it('treats a malformed realm_access.roles claim as no admin', async () => {
      const resolver = resolverReturning(null);
      const svc = new AuthzService(resolver);
      const broken: AuthenticatedUser = {
        sub: 'u',
        realm_access: { roles: 'SYSTEM_ADMIN' as unknown as never },
      };
      await expect(
        svc.can(broken, { entity: ENTITIES.COURSE, id: 'c-1' }, SCOPES.DELETE),
      ).resolves.toBe(false);
    });
  });

  describe('matrix lookups via RoleResolver result', () => {
    it('grants when the resolver returns a role that maps to the scope', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.MUDERRIS));
      await expect(
        svc.can(user(), { entity: ENTITIES.COURSE, id: 'c-1' }, SCOPES.EDIT),
      ).resolves.toBe(true);
    });

    it('denies when the resolver returns a role that does not list the scope', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.ENROLLED));
      await expect(
        svc.can(
          user(),
          { entity: ENTITIES.COURSE, id: 'c-1' },
          SCOPES.ASSIGN_MUDERRIS,
        ),
      ).resolves.toBe(false);
    });

    it('denies when the resolver returns null (no PUBLIC fallback)', async () => {
      const svc = new AuthzService(resolverReturning(null));
      // Resolvers must explicitly return ROLES.PUBLIC to grant the
      // matrix's PUBLIC row. A bare null means "no role applies" → deny.
      await expect(
        svc.can(user(), { entity: ENTITIES.COURSE, id: 'c-1' }, SCOPES.ENROLL),
      ).resolves.toBe(false);
      await expect(
        svc.can(user(), { entity: ENTITIES.COURSE, id: 'c-1' }, SCOPES.VIEW),
      ).resolves.toBe(false);
    });

    it('consults matrix.PUBLIC when the resolver explicitly returns PUBLIC', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.PUBLIC));
      // course matrix grants ENROLL to PUBLIC
      await expect(
        svc.can(user(), { entity: ENTITIES.COURSE, id: 'c-1' }, SCOPES.ENROLL),
      ).resolves.toBe(true);
      // VIEW is not granted to PUBLIC on course
      await expect(
        svc.can(user(), { entity: ENTITIES.COURSE, id: 'c-1' }, SCOPES.VIEW),
      ).resolves.toBe(false);
    });

    it('denies unknown entities entirely', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.MUDERRIS));
      await expect(
        svc.can(
          user(),
          { entity: 'made-up' as never, id: 'x' },
          SCOPES.VIEW,
        ),
      ).resolves.toBe(false);
    });
  });

  describe('flashcard-deck dispatch via explicit roles', () => {
    it('lets any authenticated caller view a public deck (resolver returns PUBLIC)', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.PUBLIC));
      await expect(
        svc.can(
          user(),
          { entity: ENTITIES.FLASHCARD_DECK, id: 'd-1' },
          SCOPES.VIEW,
        ),
      ).resolves.toBe(true);
    });

    it('lets any authenticated caller create a private deck (PUBLIC on placeholder id)', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.PUBLIC));
      await expect(
        svc.can(
          user(),
          { entity: ENTITIES.FLASHCARD_DECK, id: 'new' },
          SCOPES.CREATE_PRIVATE_DECK,
        ),
      ).resolves.toBe(true);
    });

    it('denies the stranger on a private deck (resolver returns null)', async () => {
      const svc = new AuthzService(resolverReturning(null));
      await expect(
        svc.can(
          user(),
          { entity: ENTITIES.FLASHCARD_DECK, id: 'd-1' },
          SCOPES.VIEW,
        ),
      ).resolves.toBe(false);
      await expect(
        svc.can(
          user(),
          { entity: ENTITIES.FLASHCARD_DECK, id: 'd-1' },
          SCOPES.MANAGE_PRIVATE_DECK,
        ),
      ).resolves.toBe(false);
    });

    it('lets the owner (DECK_OWNER) manage their deck', async () => {
      const svc = new AuthzService(resolverReturning(ROLES.DECK_OWNER));
      await expect(
        svc.can(
          user(),
          { entity: ENTITIES.FLASHCARD_DECK, id: 'd-1' },
          SCOPES.MANAGE_PRIVATE_DECK,
        ),
      ).resolves.toBe(true);
    });
  });

  describe('isSystemAdmin', () => {
    it('detects the realm role', () => {
      const svc = new AuthzService(resolverReturning(null));
      expect(svc.isSystemAdmin(user('u', ['SYSTEM_ADMIN']))).toBe(true);
    });

    it('returns false for users without it', () => {
      const svc = new AuthzService(resolverReturning(null));
      expect(svc.isSystemAdmin(user('u', ['SOMETHING_ELSE']))).toBe(false);
    });

    it('returns false for missing realm_access', () => {
      const svc = new AuthzService(resolverReturning(null));
      expect(svc.isSystemAdmin({ sub: 'u' })).toBe(false);
    });
  });
});
