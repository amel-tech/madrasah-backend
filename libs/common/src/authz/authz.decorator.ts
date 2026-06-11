import { SetMetadata } from '@nestjs/common';
import type { ModuleRef } from '@nestjs/core';
import type { Request } from 'express';
import { ResourceRef, Scope } from './scopes';

/**
 * Resolver signature. Synchronous when the resource ID is sitting in
 * `req.params` / `req.body`; async when a DB lookup is required (e.g. a
 * card endpoint discovers its parent deck via `ModuleRef`).
 *
 * `ModuleRef` is injected by the guard so resolvers can reach
 * repositories without the controller having to thread them through.
 * Throwing `NotFoundException` (or any other `HttpException` /
 * `MedarisError`) from within the resolver propagates as-is — useful
 * for surfacing 404 on missing resources before the matrix check runs.
 */
export type AuthzResolve = (
  req: Request,
  moduleRef: ModuleRef,
) => ResourceRef | Promise<ResourceRef>;

/** Metadata attached by {@link Authz}. Consumed by `AuthzGuard`. */
export interface AuthzMeta {
  scope: Scope;
  resolve: AuthzResolve;
}

export const AUTHZ_KEY = 'authz';

/**
 * Declare that a route requires the given `scope` on a resource
 * extracted from the request by `resolve`.
 *
 * The return type is narrowed to `MethodDecorator` deliberately: a
 * controller class typically carries handlers with different scopes,
 * so a single class-level rule is almost never what the author wants.
 * Forcing method placement at compile time prevents the footgun where
 * `@Authz(...)` silently has no effect because it was placed on the
 * class.
 *
 * @example
 *   @Patch('/courses/:id')
 *   @Authz(SCOPES.EDIT, byParam(ENTITIES.COURSE))
 *   updateCourse(...) { ... }
 *
 * @example
 *   // Creating a course is authorized against its parent kosk
 *   @Post('/courses')
 *   @Authz(SCOPES.MANAGE_COURSES, byBody(ENTITIES.KOSK, 'koskId'))
 *   createCourse(...) { ... }
 *
 * @example
 *   // A card endpoint resolves its parent deck via DB lookup
 *   @Patch('/flashcard/cards/:id')
 *   @Authz(SCOPES.MANAGE_FLASHCARDS, async (req, mod) => {
 *     const card = await mod.get(FlashcardRepository, { strict: false })
 *                            .findById(req.params.id, req.user.sub);
 *     if (!card) throw new NotFoundException(req.params.id);
 *     return { entity: ENTITIES.FLASHCARD_DECK, id: card.deckId };
 *   })
 *   updateCard(...) { ... }
 */
export const Authz = (
  scope: Scope,
  resolve: AuthzResolve,
): MethodDecorator =>
  SetMetadata<string, AuthzMeta>(AUTHZ_KEY, { scope, resolve });
