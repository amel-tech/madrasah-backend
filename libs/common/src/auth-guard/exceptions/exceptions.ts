import { UnauthorizedError } from "../../error";

class JwtDecodeError extends UnauthorizedError {
  constructor(message?: string) {
    super('JWT_DECODE_ERROR', message ?? 'Failed to decode JWT token');
    this.name = 'JwtDecodeError';
  }
}

class JwtMissingKidError extends UnauthorizedError {
  constructor(message?: string) {
    super('JWT_MISSING_KID', message ?? 'JWT does not contain a valid key ID (kid) in the header');
    this.name = 'JwtMissingKidError';
  }
}

class JwtVerificationError extends UnauthorizedError {
  constructor(message?: string) {
    super('JWT_VERIFICATION_ERROR', message ?? 'JWT verification failed');
    this.name = 'JwtVerificationError';
  }
}

class KeyNotFoundError extends UnauthorizedError {
  constructor(message?: string) {
    super('KEY_NOT_FOUND', message ?? 'Signing key not found in JWKS');
    this.name = 'KeyNotFoundError';
  }
}


export { JwtDecodeError, JwtMissingKidError, JwtVerificationError, KeyNotFoundError };