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
        retryStrategy(times) {
            retryCount++;
            if (retryCount > 10) {
                console.error("[Redis] Retry limit reached (10x). Stopping reconnects.");
                return null;
            }
            const delay = Math.min(times * 200, 2000);
            console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${retryCount})`);
            return delay;
        },
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
