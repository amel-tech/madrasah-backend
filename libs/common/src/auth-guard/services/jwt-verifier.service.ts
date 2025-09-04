import { IJwtVerifier } from '../interfaces/jwt-verifier.interface';
import { IPublicKeyProvider } from '../interfaces/public-key-provider.interface';
import { JwtDecodeError, JwtMissingKidError, JwtVerificationError } from '../exceptions/exceptions';
import { Inject, Injectable } from '@nestjs/common';
import { PUBLIC_KEY_PROVIDER } from '../auth-guard.tokens';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtVerifierService implements IJwtVerifier {
    constructor(@Inject(PUBLIC_KEY_PROVIDER) private keyProvider: IPublicKeyProvider)
    {}

    async verifyToken(token: string): Promise<any> {
        const decodedCompleteJwt = jwt.decode(token, { complete: true });
        if (!decodedCompleteJwt || typeof decodedCompleteJwt === 'string') 
            throw new JwtDecodeError();

        const kid = decodedCompleteJwt.header.kid;
        if (!kid)
            throw new JwtMissingKidError();

        const key = await this.keyProvider.getKey(kid);

        return new Promise((resolve, reject) => {
            jwt.verify(token, key, {algorithms: ['RS256']}, (err, decoded) => {
            if (err) return reject(new JwtVerificationError(err.message));
            resolve(decoded);
            });
        });
    }
}
