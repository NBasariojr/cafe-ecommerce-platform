import type { UserRole } from "@cafe/shared"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: UserRole
        jti: string
      }
    }
  }
}

export {}