import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ICache } from "../interfaces/cache.interface";
import { Cache } from "cache-manager";

@Injectable()
export class MemoryCache implements ICache<string>
{
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache)
    {}

    async getAsync(key: string): Promise<string> {
        return await this.cacheManager.get<string>(key) || "";
    }
    async setAsync(key: string, value: string, ttl: number): Promise<string> {
        return await this.cacheManager.set(key, value, ttl);
    }
    async delAsync(key: string): Promise<boolean> {
        return await this.cacheManager.del(key);
    }
    async clearAsync(): Promise<boolean> {
        return await this.cacheManager.clear();
    }
}