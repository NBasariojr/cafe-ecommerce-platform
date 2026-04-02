import { createApp } from "./app"

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10)

const app    = createApp()
const server = app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV ?? "development"})`)
})

// Graceful shutdown — finish in-flight requests before exiting.
// Called by Docker on container stop and by the OS on process kill.
function shutdown(signal: string): void {
  console.log(`[Server] ${signal} received — shutting down gracefully`)
  server.close(() => {
    console.log("[Server] All connections closed")
    process.exit(0)
  })

  // Force exit after 10s if connections are still open
  setTimeout(() => {
    console.error("[Server] Forced shutdown after timeout")
    process.exit(1)
  }, 10_000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT",  () => shutdown("SIGINT"))