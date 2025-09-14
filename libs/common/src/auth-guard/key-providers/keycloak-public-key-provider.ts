import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ICACHE } from "../auth-guard.tokens";
import { ICache } from "../interfaces/cache.interface";
import { IPublicKeyProvider } from "../interfaces/public-key-provider.interface";
import { KeyNotFoundError } from "../exceptions/exceptions";

interface Jwk {
    kid: string;
    kty: string;
    alg: string;
    use: string;
    x5c: string[];
}

interface JwksResponse {
    keys: Jwk[];
}

interface KeycloakConfig {
    jwksUrl: string;
    cacheTtl: number;
    notFoundCacheTtl: number;
}

@Injectable()
export class KeycloakPublicKeyProvider implements IPublicKeyProvider, OnModuleInit {
    private readonly config: KeycloakConfig;
    private readonly notFoundValue = "NOT_FOUND";

    constructor(@Inject(ICACHE) private cacheService: ICache<string>) {
        this.config = this.loadConfig();
    }

    private loadConfig(): KeycloakConfig {
        // Validate required environment variable
        if (!process.env.KEYCLOAK_JWKS_URL) {
            throw new Error(`KEYCLOAK_JWKS_URL environment variable is required`);
        }

        return {
            jwksUrl: process.env.KEYCLOAK_JWKS_URL,
            // Make TTL values configurable with sensible defaults
            cacheTtl: parseInt(process.env.KEYCLOAK_CACHE_TTL || '86400'), // 24 hours
            notFoundCacheTtl: parseInt(process.env.KEYCLOAK_NOT_FOUND_CACHE_TTL || '120'), // 2 minutes
        };
    }

    async getKey(kid: string): Promise<string> {
        const cachedKey = await this.cacheService.getAsync(kid);

        if (cachedKey) {
            if (cachedKey === this.notFoundValue) {
                throw new KeyNotFoundError();
            }
            return cachedKey;
        }

        const data = await this.fetchPublicKey();
        let foundKey: string | null = null;

        // Cache all keys from the JWKS response
        for (const jwk of data.keys) {
            const dataKid = jwk.kid;
            const keyValue = jwk.x5c[0];
            const pem = this.certToPEM(keyValue);

            // Fix: Use correct TTL for found keys
            await this.cacheService.setAsync(dataKid, pem, this.config.cacheTtl);

            if (dataKid === kid) {
                foundKey = pem; // Fix: Return PEM format, not raw certificate
            }
        }

        if (!foundKey) {
            await this.cacheService.setAsync(kid, this.notFoundValue, this.config.notFoundCacheTtl);
            throw new KeyNotFoundError();
        }

        return foundKey;
    }


    async onModuleInit() {
        try {
            const data = await this.fetchPublicKey();
            for (const jwk of data.keys) {
                const kid = jwk.kid;
                const key = jwk.x5c[0];
                if (jwk.use === "sig") {
                    const pem = this.certToPEM(key);
                    await this.cacheService.setAsync(kid, pem, this.config.cacheTtl);
                }
            }
        } catch (error) {
            // Log error but don't fail module initialization
            console.error('Failed to pre-load JWKS keys during module initialization:', error);
        }
    }

    async fetchPublicKey(): Promise<JwksResponse> {
        try {
            const res = await fetch(this.config.jwksUrl);

            if (!res.ok) {
                throw new Error(`Failed to fetch JWKS: ${res.status} ${res.statusText}`);
            }

            const data: JwksResponse = await res.json() as JwksResponse;

            if (!data.keys || !Array.isArray(data.keys)) {
                throw new Error('Invalid JWKS response: missing or invalid keys array');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`JWKS fetch failed: ${error.message}`);
            }
            throw new Error('JWKS fetch failed: Unknown error');
        }
    }

    certToPEM(cert: string): string {
        if (!cert) {
            throw new Error('Certificate string is required for PEM conversion');
        }

        const certLines = cert.match(/.{1,64}/g);
        if (!certLines) {
            throw new Error('Invalid certificate format for PEM conversion');
        }

        return `-----BEGIN CERTIFICATE-----\n${certLines.join("\n")}\n-----END CERTIFICATE-----\n`;
    }
}