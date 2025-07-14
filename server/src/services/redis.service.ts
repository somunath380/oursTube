import Redis from 'ioredis';
import {RedisClient} from "../db/index"

export class RedisService {
    private client: Redis;

    constructor() {
        this.client = RedisClient
        this.client.on('connect', () => console.log('connected to redis'));
    }
    async set(key: string, value: string, expirySeconds?: number): Promise<void> {
        if (expirySeconds) {
            await this.client.setex(key, expirySeconds, value);
        } else {
            await this.client.set(key, value);
        }
    }
    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }
    async del(key: string): Promise<number> {
        return await this.client.del(key);
    }
    async publish(channel: string, message: string): Promise<number> {
        return await this.client.publish(channel, message);
    }
    subscribe(channel: string, onMessage: (msg: string) => void): void {
        const subscriber = this.client.duplicate(); // separate connection for subscribe
        subscriber.subscribe(channel, () => {
            console.log(`📡 Subscribed to Redis channel: ${channel}`);
        });
        subscriber.on('message', (_, message) => {
            onMessage(message);
        });
    }

    quit(): void {
        this.client.quit();
    }
}
