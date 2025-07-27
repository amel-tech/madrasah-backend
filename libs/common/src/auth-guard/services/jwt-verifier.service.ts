
import { IJwtVerifier } from '../interfaces/jwt-verifier.interface';
import { IPublicKeyProvider } from '../interfaces/public-key-provider.interface';
import { JwtDecodeError, JwtMissingKidError, JwtVerificationError } from '../exceptions/exceptions';
import { Inject, Logger} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';



export class JwtVerifierService implements IJwtVerifier {
    private readonly logger = new Logger(JwtVerifierService.name);
    constructor(@Inject('PublicKeyProvider') private keyProvider: IPublicKeyProvider)
    {}

    async verifyToken(token: string): Promise<any> {
        const decodedHeader = jwt.decode(token, { complete: true });
        if (!decodedHeader || typeof decodedHeader === 'string') 
            throw new JwtDecodeError();

        const kid = decodedHeader.header.kid;
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
