import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/AppError"
import { jwtConfig } from "../config/jwt"
import { redisExists } from "../config/redis"
import type { AccessTokenPayload } from "../utils/token"

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract Bearer token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "TOKEN_MISSING", "Authorization header is required")
    }
    const token = authHeader.slice(7).trim()
    if (!token) {
      throw new AppError(401, "TOKEN_MISSING", "Authorization header is empty")
    }

    // 2. Verify signature and expiry
    let payload: AccessTokenPayload
    try {
      payload = jwt.verify(token, jwtConfig.accessSecret) as AccessTokenPayload
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(401, "TOKEN_EXPIRED", "Access token has expired")
      }
      throw new AppError(401, "TOKEN_INVALID", "Access token is invalid")
    }

    // 3. Check Redis blacklist
    // A blacklisted jti means the user has logged out but the token has not yet
    // expired naturally. We reject it here so logout is immediate, not 15-min-delayed.
    const isBlacklisted = await redisExists(`auth:blacklist:${payload.jti}`)
    if (isBlacklisted) {
      throw new AppError(401, "TOKEN_REVOKED", "Access token has been revoked")
    }

    // 4. Attach to req.user for downstream middleware and controllers
    req.user = {
      id:    payload.sub,
      email: payload.email,
      role:  payload.role,
      jti:   payload.jti,
      exp:   payload.exp,
    }

    next()
  } catch (err) {
    next(err)
  }
}