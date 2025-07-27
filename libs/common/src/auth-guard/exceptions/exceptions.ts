class JwtDecodeError extends Error {
  constructor(message?: string) {
    super(message ?? 'Failed to decode JWT token');
    this.name = 'JwtDecodeError';
  }
}

class JwtMissingKidError extends Error {
  constructor(message?: string) {
    super(message ?? 'JWT does not contain a valid key ID (kid) in the header');
    this.name = 'JwtMissingKidError';
  }
}

class JwtVerificationError extends Error {
  constructor(message?: string) {
    super(message ?? 'JWT verification failed');
    this.name = 'JwtVerificationError';
  }
}

export { JwtDecodeError, JwtMissingKidError, JwtVerificationError };