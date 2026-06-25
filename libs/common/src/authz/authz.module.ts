import { Global, Module } from '@nestjs/common';
import { AuthzGuard } from './authz.guard';
import { AuthzService } from './authz.service';

/**
 * Provides {@link AuthzService} (matrix decision) and {@link AuthzGuard}
 * (`@Authz` enforcement).
 *
 * `@Global()` so feature modules don't have to re-import it just to use
 * `@UseGuards(AuthGuard, AuthzGuard)`. The concrete `RoleResolver`
 * implementation is provided once per app (e.g. tedrisat binds
 * `TedrisatRoleResolver` to the `ROLE_RESOLVER` token); this module
 * does not bind a default to avoid a hidden production fallback.
 */
@Global()
@Module({
  providers: [AuthzService, AuthzGuard],
  exports: [AuthzService, AuthzGuard],
})
export class AuthzModule {}
