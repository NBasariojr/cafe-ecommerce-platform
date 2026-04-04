import express from "express"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
import { config } from "./config/index"
import { getMongoStatus } from "./config/database"
import { getRedisStatus } from "./config/redis"
import { errorHandler } from "./middleware/errorHandler"
import { notFound } from "./middleware/notFound"
import { apiResponse } from "./utils/apiResponse"

export function createApp(): express.Application {
  const app = express()

  app.use(helmet())

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (config.cors.origins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
      },
      credentials: true,
    })
  )

  app.use(morgan(config.isProd ? "combined" : "dev"))

  app.use(express.json({ limit: "10mb" }))
  app.use(express.urlencoded({ extended: true, limit: "10mb" }))

  // Health check — returns connection status for MongoDB and Redis.
  // Must respond even when DB is degraded (used by Docker health checks).
  app.get("/health", (_req, res) => {
    res.status(200).json(
      apiResponse.success({
        status:    "ok",
        timestamp: new Date().toISOString(),
        mongo:     getMongoStatus(),
        redis:     getRedisStatus(),
      })
    )
  })

  // API routes are registered here in later tasks
  // app.use("/api/auth",     authRoutes)
  // app.use("/api/products", productRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}