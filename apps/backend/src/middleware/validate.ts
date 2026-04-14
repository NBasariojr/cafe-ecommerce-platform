import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"
import { apiResponse } from "../utils/apiResponse"

// Returns Express middleware that validates req.body against a Zod schema.
// Use on any route that accepts a request body.
//
// Usage:
//   router.post("/register", validate(RegisterSchema), asyncHandler(register))
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.flatten().fieldErrors as Record<string, unknown>
      res.status(422).json(
        apiResponse.error("VALIDATION_ERROR", "Validation failed", details)
      )
      return
    }
    req.body = result.data
    next()
  }
}