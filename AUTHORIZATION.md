# Madrasah Authorization — Implementation Notes

> Companion to the handoff document. Source of truth for what's wired in
> this repo and how to extend it. Keep in sync with the code.

---

## 1. The Two-Layer Model

| Layer | Owns | When wrong |
|---|---|---|
| **Authentication** | Keycloak. Issues JWT, signs with realm public key. | 401 — token missing / invalid / expired |
| **Authorization** | NestJS backend. Matrix (`MATRIX[entity][role]`) + DB-driven `RoleResolver`. | 403 — caller authenticated but not allowed |

Keycloak does NOT carry resource-level roles. The JWT only carries `sub`,
the standard OIDC claims, and the `SYSTEM_ADMIN` realm role. Resource
roles (KOSK_MANAGER, MUDERRIS, ENROLLED, DECK_OWNER, …) are resolved
live from domain tables on every authz check. Trade-off: one short DB
query per protected request, no JWT bloat, no identity-sync layer, no
stale-token window.

---

## 2. Keycloak Configuration

### Realm

- Single realm: `amel-tech-dev` (the local dev realm; production will be named `amel-tech-prod` and `amel-tech-staging` accordingly).
- Token lifetime: 15–30 min access, 30 day refresh.

### Clients

| Client | Type | Purpose |
|---|---|---|
| `nizam-web` | public + PKCE | Yönetim SPA |
| `tedris-web` | public + PKCE | Öğrenci SPA |
| `tedrisat-api` | bearer-only (confidential) | Backend API, validates tokens |

Both frontend clients carry an **audience mapper** that emits
`aud: tedrisat-api`. The backend rejects tokens whose audience does not
match.

### Realm Roles

Only one: `SYSTEM_ADMIN`. Everything else lives in DB.

### What does NOT exist

- No `resourceRoles` user attribute.
- No protocol mapper that emits resource roles.
- No identity-sync layer that writes role assignments back to Keycloak.

If you find yourself wanting any of these, you're working from the
older walkthrough — see §6 of the handoff document for why we don't.

---

## 3. Backend Architecture

### File layout

```
libs/common/src/authz/
  scopes.ts                  # SCOPES, ENTITIES, ROLES constants + types, ResourceRef
  auth-matrix.ts             # MATRIX[entity][role] = scopes[]
  authz.decorator.ts         # @Authz(scope, resolve)
  authz.guard.ts             # AuthzGuard (reads metadata, runs resolver, calls service)
  authz.service.ts           # AuthzService.can(user, resource, scope)
  resolvers.ts               # byParam, byBody, byQuery helpers
  role-resolver.interface.ts # RoleResolver contract + ROLE_RESOLVER token
  exceptions/                # AuthzForbiddenError, AuthzMissingUserError, AuthzResolverError
  interfaces/                # AuthenticatedUser
  authz.module.ts            # @Global module — providers, no role-resolver binding
  index.ts                   # public surface

apps/tedrisat/src/authz/
  tedrisat-role-resolver.service.ts # DB-driven RoleResolver implementation
  authz-bindings.module.ts          # @Global module that binds the impl to ROLE_RESOLVER
```

### Request lifecycle

```
┌── HTTP request ──────────────────────────────────────────────────────┐
│ 1. AuthGuard  : validates JWT (signature, iss, aud, exp)             │
│                 → request.user = { sub, realm_access, ... }          │
│ 2. AuthzGuard : reads @Authz metadata on handler                     │
│                 → calls meta.resolve(req, moduleRef)                 │
│                 → calls AuthzService.can(user, resource, scope)      │
│ 3. AuthzService.can :                                                │
│      a. Realm-role bypass: if SYSTEM_ADMIN, allow                    │
│      b. RoleResolver.resolve(userId, resource) → Role | null         │
│      c. role ?? PUBLIC                                               │
│      d. MATRIX[entity][role].includes(scope) → allow / deny          │
│ 4. Handler executes                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Three guard outcomes

- `403 AUTHZ_FORBIDDEN` — matrix denial
- `401 AUTHZ_MISSING_USER` — guard ran without AuthGuard (config bug)
- `500 AUTHZ_RESOLVER_ERROR` — resolver returned an empty ID or threw
  an unexpected (non-HttpException, non-MedarisError) error

`NotFoundException` and other domain errors thrown *inside a resolver*
propagate unwrapped, so a card endpoint whose resolver looks up the
parent deck can throw 404 cleanly.

---

## 4. Wiring a New Endpoint

For most endpoints:

```ts
import { Authz, AuthzGuard, byParam, ENTITIES, SCOPES } from '@madrasah/common';

@UseGuards(AuthGuard, AuthzGuard)
@Controller('courses')
export class CourseController {
  @Authz(SCOPES.EDIT, byParam(ENTITIES.COURSE))
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) { ... }
}
```

When the resource is named in the body or query string:

```ts
@Authz(SCOPES.MANAGE_COURSES, byBody(ENTITIES.KOSK, 'koskId'))
@Post()
create(@Body() dto: CreateCourseDto) { ... }

@Authz(SCOPES.VIEW, byQuery(ENTITIES.FLASHCARD_DECK, 'deckId'))
@Get('cards')
list(@Query('deckId') id: string) { ... }
```

When the route only carries a child ID and authz happens against the
parent (e.g. flashcard card → parent deck):

```ts
const cardParentDeck = (param = 'id') =>
  async (req: Request, mod: ModuleRef): Promise<ResourceRef> => {
    const cardId = (req.params as Record<string, string>)[param];
    const userId = (req as AuthorizedRequest).user.sub;
    const card = await mod
      .get(FlashcardRepository, { strict: false })
      .findById(cardId, userId);
    if (!card) throw new NotFoundException(`Card ${cardId} not found`);
    return { entity: ENTITIES.FLASHCARD_DECK, id: card.deckId };
  };

@Authz(SCOPES.MANAGE_FLASHCARDS, cardParentDeck())
@Patch('cards/:id')
update(...) { ... }
```

### Multi-resource batches

Endpoints that touch many resources in a single call (e.g.
`PUT /flashcard/cards/progress`) cannot be expressed with the
single-resource `@Authz` decorator. Do the visibility check in the
service instead — see `FlashcardService.replaceManyProgress`.

---

## 5. Extending the Matrix or `RoleResolver`

**New scope:** add to `SCOPES` in `libs/common/src/authz/scopes.ts`,
update the matrix entries it appears in, and update the structural
invariant tests if your new scope needs a positive coverage check.

**New entity:** add to `ENTITIES`, add a `MATRIX[entity]` row, and add
a `resolveXRole` method to `TedrisatRoleResolver`.

**New role:** add to `ROLES`, then ensure `RoleResolver` can return it
(with a documented priority rule vs. existing roles).

**New deck variant** (medrese/kosk/course): extend the matrix's
`flashcard-deck` row with the role that owns the new variant, and add
the variant's dispatch path to `TedrisatRoleResolver.resolveDeckRole`.

---

## 6. Deviations From the Long-Term Plan Document

1. **Resource roles come from the DB, not the JWT.** Plan and earlier
   walkthrough proposed a Keycloak user attribute + protocol mapper that
   would carry `resource_roles` in the JWT. This implementation drops
   the attribute, drops the mapper, drops the identity-sync layer.
2. **The 5 deck variants from plan §4.2 collapse to one
   `flashcard-deck` entity.** Variant dispatch lives in
   `RoleResolver.resolveDeckRole`. Today only `private` and `public`
   (`isPublic`) are realised in the schema; `medrese` / `kosk` /
   `course` variants land when those foreign keys exist.
3. **`SCOPES.CREATE_FLASHCARD` / `SCOPES.MANAGE_FLASHCARDS` are single
   scopes**, not per-variant ones. Who has them on a given deck depends
   on the role the resolver returns for that deck.

Each deviation is in the handoff doc §6.

---

## 7. Open Questions

- **`MANAGE_TAGS` vs `MANAGE_MADRASAH_TAGS` vs `MANAGE_PUBLIC_TAGS`** —
  three scope names for what may be one concept. Need product input
  before the tagging endpoints land.
- **`GUEST` vs `PUBLIC`** — plan §4 uses `GUEST` to mean both "anyone,
  unauthenticated" and "authenticated but unrelated". Matrix here uses
  only `PUBLIC` = "any authenticated caller". A separate `@AuthzPublic`
  decorator is needed for endpoints intentionally open to anonymous
  callers (donations, marketing).
- **Independent kosk creation** — which role can create a kosk with no
  parent madrasah? Product call.
- **Pending → Enrolled** — single SQL UPDATE in this architecture;
  no two-system coordination required.
- **Cache layer** — `RoleResolver` calls hit the DB on every protected
  request. A Redis (or in-memory `cache-manager`) layer with a short
  TTL belongs in the resolver. Not in this PR; size with N+1 measurements.

---

## 8. Critical Findings Fixed In This Branch

Code review surfaced four critical/high-severity findings against the
earlier JWT-claim authz architecture. Equivalent fixes are carried
forward:

| # | Issue | Fix in this branch |
|---|---|---|
| 1 | `addToUserCollection` allowed attaching foreign private decks | `@Authz(VIEW, byParam(FLASHCARD_DECK))` on the endpoint; repo `findAllByUser` adds `(isPublic OR authorId)` filter as defence-in-depth |
| 2 | `PATCH/PUT` could flip `isPublic` and publish | `UpdateFlashcardDeckDto = PartialType(OmitType(CreateFlashcardDeckDto, ['isPublic']))`; PUT uses `ReplaceFlashcardDeckDto` (also without `isPublic`); publishing requires a dedicated admin-only endpoint (out of scope) |
| 3 | Owner locked out without identity-sync | Resolved structurally: `TedrisatRoleResolver` derives `DECK_OWNER` live from `decks.authorId`; no shim needed |
| 4 | `replaceManyProgress` wrote progress for any flashcardId | Service-level multi-resource visibility check via `FlashcardRepository.findVisibilityByIds`; `SYSTEM_ADMIN` bypass; `NotFoundException` for missing IDs, `AuthzForbiddenError` for unreachable decks |

---

## 9. Local Verification

```bash
# from madrasah-backend/
( cd libs/common && npm run type-check )
( cd libs/common && npm run build )
( cd apps/tedrisat && npx tsc --noEmit -p tsconfig.json )
( cd apps/tedrisat && npm test )
( cd apps/tedrisat && npm test -- --testPathPattern="authz|flashcard" )
```

Expected: ts-jest green, 100+ tests pass.
