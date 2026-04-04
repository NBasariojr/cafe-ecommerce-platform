import { createApp } from "./app"
import { connectDB, disconnectDB } from "./config/database"
import { connectRedis, redis } from "./config/redis"

// config/index.ts validates all env vars and exits on failure.
// The import below triggers that validation before anything else runs.
import "./config/index"

const PORT = parseInt(process.env.PORT ?? "3000", 10)

async function start(): Promise<void> {
  // Connect to MongoDB — required, throws on failure
  await connectDB()

  // Connect to Redis — optional, warns but does not throw
  await connectRedis()

  const app    = createApp()
  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV ?? "development"})`)
  })

  function shutdown(signal: string): void {
    console.log(`[Server] ${signal} received — shutting down gracefully`)
    server.close(async () => {
      await disconnectDB()
      await redis.quit()
      console.log("[Server] All connections closed")
      process.exit(0)
    })

    setTimeout(() => {
      console.error("[Server] Forced shutdown after timeout")
      process.exit(1)
    }, 10_000).unref()
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"))
  process.on("SIGINT",  () => shutdown("SIGINT"))
}

start().catch((err) => {
  console.error("[Server] Failed to start:", err instanceof Error ? err.message : err)
  process.exit(1)
})