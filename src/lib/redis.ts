import Redis from "ioredis";

declare global {
    var redis: InstanceType<typeof Redis> | undefined;
}

function createRedisClient() {
    const host = process.env.REDIS_HOST!;
    const port = Number(process.env.REDIS_PORT || 6379);
    const username = process.env.REDIS_USERNAME!;
    const password = process.env.REDIS_PASSWORD!;

    let retryCount = 0;

    const client = new Redis({
        host,
        port,
        username,
        password,
        connectTimeout: 10000,
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: null,
    });

    client.on("ready", () => console.log("[Redis] Ready ✅"));
    client.on("error", (err) => console.error("[Redis] Error ❌", err.message));
    client.on("end", () => console.warn("[Redis] Connection ended"));

    return client;
}

if (!global.redis) {
    global.redis = createRedisClient();
}

export const redis = global.redis!;
