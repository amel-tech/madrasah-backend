import { Inject, Injectable } from '@nestjs/common';
import { MATRIX } from './auth-matrix';
import { ROLE_RESOLVER, RoleResolver } from './role-resolver.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Entity, ResourceRef, Role, ROLES, Scope } from './scopes';

const SYSTEM_ADMIN_REALM_ROLE = ROLES.SYSTEM_ADMIN;

@Injectable()
export class AuthzService {
  constructor(
    @Inject(ROLE_RESOLVER) private readonly roles: RoleResolver,
  ) {}

  /**
   * Decide whether `user` may invoke `scope` on `resource`.
   *
   * Algorithm:
   *   1. Realm-role bypass: if `realm_access.roles` carries
   *      SYSTEM_ADMIN, allow everything.
   *   2. Ask `RoleResolver` for the caller's role on this specific
   *      resource. The resolver does the domain-level work (deck variant
   *      dispatch, enrollment lookup, ownership join). If it returns
   *      `null`, treat the caller as `PUBLIC`.
   *   3. Look the role's scopes up in `MATRIX[entity]`. Allow iff the
   *      requested scope is listed.
   *
   * The matrix is closed by default — anything not explicitly granted
   * is denied.
   *
   * `realm_access.roles` is read defensively: if Keycloak's protocol
   * mapper is misconfigured and the claim arrives as a string instead
   * of an array, the `Array.isArray` guard treats it as empty (no
   * bypass) rather than throwing.
   */
  async can(
    user: AuthenticatedUser,
    resource: ResourceRef,
    scope: Scope,
  ): Promise<boolean> {
    if (this.isSystemAdmin(user)) return true;

    // `null` from the resolver means "no role applies on this resource" —
    // a strict deny. Resolvers must explicitly return `ROLES.PUBLIC` when
    // the resource is open to any authenticated caller (e.g. a public
    // deck, a madrasah donation endpoint). This prevents leaks where a
    // null-fallback would silently grant `PUBLIC.view` on a private
    // resource the caller has no role on.
    const role = await this.roles.resolve(user.sub, resource);
    if (!role) return false;
    return this.matrixGrants(resource.entity, role, scope);
  }

  /** Convenience overload that takes only the user ID — for call sites
   *  that have already snapshotted realm membership elsewhere. Prefer
   *  {@link can} when you have the full user object. */
  async canByUserId(
    userId: string,
    resource: ResourceRef,
    scope: Scope,
  ): Promise<boolean> {
    const role = await this.roles.resolve(userId, resource);
    if (!role) return false;
    return this.matrixGrants(resource.entity, role, scope);
  }

  /**
   * Matrix lookup with PUBLIC inheritance.
   *
   * Every role implicitly inherits the entity's `PUBLIC` scopes —
   * "PUBLIC" by definition means "open to any authenticated caller", so
   * a KOSK_MANAGER who also wants to invoke a PUBLIC scope (e.g.
   * `enroll` on their own course, `donate` on a madrasah) should not be
   * blocked because they happen to hold a more specialised role.
   *
   * This does NOT relax the strict-deny semantic for `null` roles —
   * `can` short-circuits before reaching this method when the resolver
   * returns null.
   */
  private matrixGrants(entity: Entity, role: Role, scope: Scope): boolean {
    const roleScopes = MATRIX[entity]?.[role] ?? [];
    if (roleScopes.includes(scope)) return true;
    if (role === ROLES.PUBLIC) return false;
    const publicScopes = MATRIX[entity]?.[ROLES.PUBLIC] ?? [];
    return publicScopes.includes(scope);
  }

  /** Reports whether the caller holds the SYSTEM_ADMIN realm role.
   *  Exposed for service-layer code that needs the bypass outside the
   *  matrix flow (e.g. multi-resource batch operations). */
  isSystemAdmin(user: AuthenticatedUser): boolean {
    const roles = user.realm_access?.roles;
    return Array.isArray(roles) && roles.includes(SYSTEM_ADMIN_REALM_ROLE);
  }
}
