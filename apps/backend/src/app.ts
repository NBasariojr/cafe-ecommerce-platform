import express from "express"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
import { errorHandler } from "./middleware/errorHandler"
import { notFound } from "./middleware/notFound"
import { apiResponse } from "./utils/apiResponse"

export function createApp(): express.Application {
  const app = express()

  // Security headers
  app.use(helmet())

  // CORS — whitelist only, never wildcard in production
  const allowedOrigins = new Set(
    (process.env.CORS_ORIGIN ?? "http://localhost:5173")
      .split(",")
      .map((o) => o.trim())
  )

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true)
        if (allowedOrigins.has(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
      },
      credentials: true,
    })
  )

  // Request logging — concise in production, dev format in development
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

  // Body parsers
  // The webhook route needs raw body — handled separately in payment routes
  app.use(express.json({ limit: "10mb" }))
  app.use(express.urlencoded({ extended: true, limit: "10mb" }))

  // Health check — must respond even when DB is down
  // Full health (mongo + redis status) added in Task 0-07
  app.get("/health", (_req, res) => {
    res.status(200).json(
      apiResponse.success({
        status: "ok",
        timestamp: new Date().toISOString(),
      })
    )
  })

  // API routes registered here in later tasks
  // app.use("/api/auth",     authRoutes)
  // app.use("/api/products", productRoutes)
  // etc.

  // 404 handler — must come after all routes
  app.use(notFound)

  // Global error handler — must be last
  app.use(errorHandler)

  return app
}