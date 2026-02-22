// auth/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { IJwtVerifier } from './interfaces/jwt-verifier.interface';
import { JWT_VERIFIER } from './auth-guard.tokens';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(JWT_VERIFIER) private readonly jwtVerifier: IJwtVerifier) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = await this.jwtVerifier.verifyToken(token);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
