import mongoose from "mongoose"
import { config } from "./index"

// Tracks current connection state for the /health endpoint
let connectionState: "disconnected" | "connecting" | "connected" | "error" = "disconnected"

export function getMongoStatus(): string {
  return connectionState
}

export async function connectDB(): Promise<void> {
  connectionState = "connecting"

  mongoose.connection.on("connected", () => {
    connectionState = "connected"
    console.log("[MongoDB] Connected")
  })

  mongoose.connection.on("disconnected", () => {
    connectionState = "disconnected"
    console.log("[MongoDB] Disconnected")
  })

  mongoose.connection.on("error", (err) => {
    connectionState = "error"
    console.error("[MongoDB] Connection error:", err.message)
  })

  try {
    await mongoose.connect(config.db.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
    })
  } catch (err) {
    connectionState = "error"
    const message = err instanceof Error ? err.message : String(err)
    console.error("[MongoDB] Initial connection failed:", message)
    throw err
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
  connectionState = "disconnected"
}