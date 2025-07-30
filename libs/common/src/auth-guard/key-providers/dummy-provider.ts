import { IPublicKeyProvider } from '../interfaces/public-key-provider.interface';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DummyPublicKeyProvider implements IPublicKeyProvider {
  private readonly keyCache = new Map<string, string>();

constructor() {
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApIvjZ5oDTgrxpqt3lr8y
Ck3tkzbFsYQmo7tHsBQZ5lN0H5FtreBeoA8tPcomQbigCHWQwVAFCFhmXitPQvHv
DKPdEXfuihDmqq0MAMqjnYInRGSrH1l1CyDGrOQUbLjNkeG+5PygNffjIRFRFDDX
AJp6akaJHi2ROD6YSAB3MoToqtaIR6VlEzlRjHxsG6vuKDwyZ/w+6MxrLtvLMMwD
msX1Ie703Gmbms82m47M9+HzYzyFOCibBXtMab9tj2bKD/WEu0H2Xh4CSn+utp5/
xuFqRFL9YwzKq8LTzLcY0PUB0FKvrhfIg6x4SZ4Mmlw8kJHy/zfFbTIaFwRiLUsp
wQIDAQAB
-----END PUBLIC KEY-----`;
  this.preloadKey(
    '2f2eaa99103230d2876876186fdb24da',
    publicKey
  );
}

  async getKey(kid: string): Promise<string> {
    const key = this.keyCache.get(kid);
    if (!key) {
      throw new Error(`Key not found`);
    }
    return key;
  }

  preloadKey(kid: string, key: string) {
    this.keyCache.set(kid, key);
  }
}
