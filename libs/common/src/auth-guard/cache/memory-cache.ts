import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ICache } from "../interfaces/cache.interface";
import { Cache } from "cache-manager";

@Injectable()
export class MemoryCache implements ICache<string> {
    private readonly logger = new Logger(MemoryCache.name);

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    async getAsync(key: string): Promise<string> {
        try {
            const value = await this.cacheManager.get<string>(key);
            this.logger.debug(`Cache GET: ${key} -> ${value ? 'HIT' : 'MISS'}`);
            return value || "";
        } catch (error) {
            this.logger.error(`Cache GET failed for key: ${key}`, error);
            return "";
        }
    }

    async setAsync(key: string, value: string, ttl: number): Promise<string> {
        try {
            await this.cacheManager.set(key, value, ttl * 1000);
            this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
            return value;
        } catch (error) {
            this.logger.error(`Cache SET failed for key: ${key}`, error);
            throw error;
        }
    }

    async delAsync(key: string): Promise<boolean> {
        try {
            const result = await this.cacheManager.del(key);
            this.logger.debug(`Cache DEL: ${key} -> ${result ? 'SUCCESS' : 'NOT_FOUND'}`);
            return !!result;
        } catch (error) {
            this.logger.error(`Cache DEL failed for key: ${key}`, error);
            return false;
        }
    }

    async clearAsync(): Promise<boolean> {
        try {
            await this.cacheManager.clear();
            this.logger.debug('Cache CLEAR: ALL');
            return true;
        } catch (error) {
            this.logger.error('Cache CLEAR failed', error);
            return false;
        }
    }
}