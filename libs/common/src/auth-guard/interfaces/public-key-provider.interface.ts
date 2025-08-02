export interface IPublicKeyProvider {
  /**
   * Retrieves the public key associated with the given key ID (kid).
   * @param kid The key ID for which to retrieve the public key.
   * @returns A promise that resolves to the public key as a string.
   */
    getKey(kid: string): Promise<string>;
}