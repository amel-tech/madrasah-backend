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

@Injectable()
export class KeycloakPublicKeyProvider implements IPublicKeyProvider, OnModuleInit
{
    private readonly jwksUrl = process.env.KEYCLOAK_JWKS_URL!;
    private readonly cacheTtl = 24 * 60 * 60;
    private readonly notFoundCacheTtl = 120;
    private readonly notFoundValue = "NOT_FOUND";

    constructor(@Inject(ICACHE) private cacheService: ICache<string>) {}

    async getKey(kid: string): Promise<string> {
        let key = await this.cacheService.getAsync(kid);

        if (key) {
            if (key === "NOT_FOUND") throw new KeyNotFoundError();
            return key;
        }

        const data = await this.fetchPublicKey();
        let foundKey: string | null = null;
        for (const jwk of data.keys) {
            const dataKid = jwk.kid;
            const keyValue = jwk.x5c[0];
            const pem = this.certToPEM(keyValue);
            await this.cacheService.setAsync(dataKid, pem, this.notFoundCacheTtl);
            if (dataKid === kid) {
                foundKey = keyValue;
            }
        }

        if (!foundKey) {
            await this.cacheService.setAsync(kid, this.notFoundValue, this.notFoundCacheTtl);
            throw new KeyNotFoundError();
        }

        return foundKey;
    }


    async onModuleInit() {
       var data = await this.fetchPublicKey();
        for (const jwk of data.keys) {
            const kid = jwk.kid;
            const key = jwk.x5c[0];
            if (jwk.use === "sig")
            {
                var pem = this.certToPEM(key);
                await this.cacheService.setAsync(kid, pem, this.cacheTtl);
            }
        }
    }

    async fetchPublicKey() : Promise<JwksResponse>
    {
        const res = await fetch(this.jwksUrl);
        const data: JwksResponse = (await res.json()) as JwksResponse;
        return data;
    }

    certToPEM(cert: string): string {
        return `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g)?.join("\n")}\n-----END CERTIFICATE-----\n`;
    }

}