import type { Request, Response, NextFunction } from "express"
import { UserRole } from "@cafe/shared"
import { AppError } from "../utils/AppError"

// Returns middleware that restricts a route to users whose role
// is in the provided list. Requires authenticate to run first.
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, "TOKEN_MISSING", "Authentication required")
    }
    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action"
      )
    }
    next()
  }
}