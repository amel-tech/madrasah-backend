export interface ICache<T>
{
    getAsync(key: string) : Promise<T>
    setAsync(key: string, value: T, ttl: number) : Promise<T>
    delAsync(key: string) : Promise<boolean>
    clearAsync() : Promise<boolean>
}