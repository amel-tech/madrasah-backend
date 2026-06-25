import { Global, Module } from '@nestjs/common';
import { ROLE_RESOLVER } from '@madrasah/common';
import { DatabaseModule } from '../database/database.module';
import { TedrisatRoleResolver } from './tedrisat-role-resolver.service';

/**
 * Binds the tedrisat-specific concrete `RoleResolver` to the
 * `ROLE_RESOLVER` token consumed by the global `AuthzModule`.
 *
 * Must be `@Global()` because `AuthzService` (which lives in the
 * `@Global` `AuthzModule` in `@madrasah/common`) injects
 * `ROLE_RESOLVER` — and a non-global binding would not be visible to
 * a globally-registered provider's constructor at boot.
 */
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: ROLE_RESOLVER,
      useClass: TedrisatRoleResolver,
    },
  ],
  exports: [ROLE_RESOLVER],
})
export class AuthzBindingsModule {}
