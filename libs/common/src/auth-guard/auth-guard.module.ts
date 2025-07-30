import { Module, DynamicModule } from "@nestjs/common";
import { AuthGuard } from './auth-guard';
import { JwtVerifierService } from './services/jwt-verifier.service';
import { DummyPublicKeyProvider } from './key-providers/dummy-provider';
import { PUBLIC_KEY_PROVIDER, JWT_VERIFIER } from "./auth-guard.tokens";

@Module({
  providers: [
      {
        provide: PUBLIC_KEY_PROVIDER,
        useClass: DummyPublicKeyProvider,
      },
      {
        provide: JWT_VERIFIER,
        useClass: JwtVerifierService,
      },
      AuthGuard
  ],
  exports: [AuthGuard, PUBLIC_KEY_PROVIDER, JWT_VERIFIER],
})
export class AuthGuardModule {}
