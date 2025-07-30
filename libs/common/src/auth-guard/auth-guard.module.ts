import { Module, Global } from "@nestjs/common";
import { AuthGuard } from './auth-guard.guard';
import { JwtVerifierService } from './services/jwt-verifier.service';
import { DummyPublicKeyProvider } from './key-providers/dummy-provider';

export const JWT_VERIFIER = 'JWT_VERIFIER';
export const PUBLIC_KEY_PROVIDER = 'PUBLIC_KEY_PROVIDER';

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
    AuthGuard,
  ],
  exports: [AuthGuard],
})
export class AuthGuardModule {}