import { Redis } from "ioredis"
import { config } from "./index"

// Redis is a performance layer — its errors must never crash the server.
// All helpers return null/false on failure instead of throwing.

let redisStatus: "disconnected" | "connecting" | "connected" | "error" = "disconnected"

export function getRedisStatus(): string {
  return redisStatus
}

const redis = new Redis(config.db.redisUrl, {
  // Retry connection up to 3 times, then stop (server stays up without Redis)
  maxRetriesPerRequest: 3,
  enableOfflineQueue:   false,
  lazyConnect:          true,
})

redis.on("connect", () => {
  redisStatus = "connected"
  console.log("[Redis] Connected")
})

redis.on("close", () => {
  redisStatus = "disconnected"
})

redis.on("error", (err) => {
  redisStatus = "error"
  // Only log connection errors — avoid flooding logs on repeated failures
  if (err.message.includes("ECONNREFUSED") || err.message.includes("ETIMEDOUT")) {
    console.warn("[Redis] Connection error:", err.message)
  }
})

export async function connectRedis(): Promise<void> {
  redisStatus = "connecting"
  try {
    await redis.connect()
  } catch (err) {
    redisStatus = "error"
    const message = err instanceof Error ? err.message : String(err)
    console.warn("[Redis] Failed to connect:", message)
    // Not re-thrown — Redis is optional for server startup
  }
}

// Get a value by key. Returns null if key does not exist or on error.
export async function redisGet(key: string): Promise<string | null> {
  try {
    return await redis.get(key)
  } catch {
    return null
  }
}

// Set a value with an optional TTL in seconds (0 = no expiry).
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds = 0
): Promise<void> {
  try {
    if (ttlSeconds > 0) {
      await redis.set(key, value, "EX", ttlSeconds)
    } else {
      await redis.set(key, value)
    }
  } catch (err) {
    console.warn("[Redis] redisSet failed:", err instanceof Error ? err.message : err)
  }
}

// Delete a key. Does not throw if the key does not exist.
export async function redisDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys)
  } catch (err) {
    console.warn("[Redis] redisDel failed:", err instanceof Error ? err.message : err)
  }
}

// Check if a key exists. Returns false on error.
export async function redisExists(key: string): Promise<boolean> {
  try {
    const count = await redis.exists(key)
    return count > 0
  } catch {
    return false
  }
}

// Export the raw client for advanced usage (pipeline, transactions, etc.)
export { redis }