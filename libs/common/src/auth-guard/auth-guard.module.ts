import { Module } from "@nestjs/common";
import { AuthGuard } from './auth-guard';
import { JwtVerifierService } from './services/jwt-verifier.service';
import { PUBLIC_KEY_PROVIDER, JWT_VERIFIER, ICACHE } from "./auth-guard.tokens";
import { CacheModule } from "@nestjs/cache-manager";
import { MemoryCache } from "./cache/memory-cache";
import { KeycloakPublicKeyProvider } from "./key-providers/keycloak-public-key-provider";

@Module({
  imports: [CacheModule.register()],
  providers: [
      {
        provide: ICACHE,
        useClass: MemoryCache,
      },
      {
        provide: PUBLIC_KEY_PROVIDER,
        useClass: KeycloakPublicKeyProvider,
      },
      {
        provide: JWT_VERIFIER,
        useClass: JwtVerifierService,
      },
      AuthGuard
  ],
  exports: [AuthGuard, PUBLIC_KEY_PROVIDER, JWT_VERIFIER, ICACHE],
})
export class AuthGuardModule {}
