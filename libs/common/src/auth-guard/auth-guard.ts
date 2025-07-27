// auth/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtVerifierService } from './services/jwt-verifier.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtVerifier: JwtVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorizationadasdasds');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      const decoded = await this.jwtVerifier.verifyToken(token);
      request.user = decoded;
      return true;
    } catch (error : any) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }
  }
}
