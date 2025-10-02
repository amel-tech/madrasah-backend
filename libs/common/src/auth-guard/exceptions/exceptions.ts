import { UnauthorizedError } from "../../error";
import { ErrorContext } from "../../error/types";

abstract class JwtAuthError extends UnauthorizedError {
  protected constructor(code: string, message: string, context?: ErrorContext) {
    super(code, message, context);
  }
}

export class JwtDecodeError extends JwtAuthError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'JWT_DECODE_ERROR', 
      message ?? 'Failed to decode JWT token',
      context
    );
  }
}

export class JwtMissingKidError extends JwtAuthError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'JWT_MISSING_KID', 
      message ?? 'JWT does not contain a valid key ID (kid) in the header',
      context
    );
  }
}

export class JwtVerificationError extends JwtAuthError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'JWT_VERIFICATION_ERROR', 
      message ?? 'JWT verification failed',
      context
    );
  }
}

export class KeyNotFoundError extends JwtAuthError {
  constructor(message?: string, context?: ErrorContext) {
    super(
      'KEY_NOT_FOUND', 
      message ?? 'Signing key not found in JWKS',
      context
    );
  }
}