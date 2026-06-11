import { ErrorContext } from '../../error/types';
import { ForbiddenError } from '../../error/errors/base/forbidden.error';
import { InternalServerError } from '../../error/errors/base/internal-server.error';
import { UnauthorizedError } from '../../error/errors/base/unauthorized.error';

export class AuthzForbiddenError extends ForbiddenError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'AUTHZ_FORBIDDEN',
      message ??
        'Caller is not authorized for the requested scope on this resource',
      context,
    );
  }
}

export class AuthzMissingUserError extends UnauthorizedError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'AUTHZ_MISSING_USER',
      message ??
        'AuthzGuard requires an authenticated request; ensure AuthGuard runs first',
      context,
    );
  }
}

/**
 * Raised when the `@Authz` resolver returns an empty/invalid resource
 * reference. This is a server-side configuration problem (typically a
 * route-param name mismatch) and is surfaced as a 500 with a clear
 * `AUTHZ_RESOLVER_ERROR` code so operators don't mistake it for a
 * Keycloak/claim issue.
 */
export class AuthzResolverError extends InternalServerError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'AUTHZ_RESOLVER_ERROR',
      message ?? 'The @Authz resolver returned an invalid resource reference',
      context,
    );
  }
}
