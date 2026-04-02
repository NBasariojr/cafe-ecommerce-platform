import type { Request, Response } from "express"
import { apiResponse } from "../utils/apiResponse"

// Catches any request that did not match a registered route.
// Must be registered AFTER all routes and BEFORE the error handler.
export function notFound(req: Request, res: Response): void {
  res.status(404).json(
    apiResponse.error(
      "ROUTE_NOT_FOUND",
      `Cannot ${req.method} ${req.path}`
    )
  )
}