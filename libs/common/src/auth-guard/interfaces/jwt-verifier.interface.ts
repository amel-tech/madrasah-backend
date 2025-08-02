export interface IJwtVerifier {
  /**
   * Verifies the JWT token.
   * @param token The JWT string to be verified.
   * @returns The decoded payload or an error.
   * @throws {JwtDecodeError} If token header cannot be decoded.
   * @throws {JwtMissingKidError} If the 'kid' is missing from header.
   * @throws {JwtVerificationError} If token verification fails.
   */
    verifyToken(token: string): Promise<any>;
}
