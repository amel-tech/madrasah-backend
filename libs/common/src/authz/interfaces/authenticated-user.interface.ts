/**
 * Minimal projection of the Keycloak access token that the authorization
 * layer relies on. Other claims (preferred_username, email, …) are not
 * required for authorization decisions and live in the domain-specific
 * `UserPayload` interfaces.
 *
 * Note: there is no `resource_roles` claim. Resource-level roles are
 * resolved live from the DB by `RoleResolver` at request time.
 * `SYSTEM_ADMIN` is the only role surfaced through the JWT, via the
 * standard `realm_access.roles` claim.
 */
export interface AuthenticatedUser {
  sub: string;
  realm_access?: { roles?: string[] };
}
