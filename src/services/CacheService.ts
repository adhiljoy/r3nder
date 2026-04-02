export class CacheService {
    private cache: Map<string, { value: any; expiry: number }> = new Map();

    constructor() {}

    public set(key: string, value: any, ttlMs: number): void {
        const expiry = Date.now() + ttlMs;
        this.cache.set(key, { value, expiry });
    }

    public get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    public delete(key: string): void {
        this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }
}
