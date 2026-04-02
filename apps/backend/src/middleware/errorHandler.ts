import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { AppError } from "../utils/AppError"
import { apiResponse } from "../utils/apiResponse"

// Mongoose duplicate key error code
const MONGO_DUPLICATE_KEY_CODE = 11000

// Global error handler — must be registered AFTER all routes in app.ts.
// Handles four error types in order:
//   1. AppError    - intentional errors thrown in route handlers
//   2. ZodError    - schema validation failures
//   3. Mongoose    - duplicate key constraint violations
//   4. Unknown     - anything else (never expose internals in production)
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === "development"

  // AppError — thrown intentionally by services and controllers
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      apiResponse.error(err.code, err.message, err.details)
    )
    return
  }

  // ZodError — schema parse failed (validation errors)
  if (err instanceof ZodError) {
    const details = err.flatten().fieldErrors as Record<string, unknown>
    res.status(422).json(
      apiResponse.error("VALIDATION_ERROR", "Validation failed", details)
    )
    return
  }

  // Mongoose duplicate key (E11000)
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === MONGO_DUPLICATE_KEY_CODE
  ) {
    res.status(409).json(
      apiResponse.error("DUPLICATE_ENTRY", "A record with this value already exists")
    )
    return
  }

  // Unknown error — log it, never expose internals to the client in production
  console.error("[ErrorHandler] Unhandled error:", err)

  const message = isDev && err instanceof Error ? err.message : "An unexpected error occurred"
  const stack   = isDev && err instanceof Error ? err.stack   : undefined

  res.status(500).json(
    apiResponse.error("INTERNAL_ERROR", message, stack ? { stack } : undefined)
  )
}