import { OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleDestroy {
    private readonly logger;
    private readonly client;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null>;
    del(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    ping(): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
}
