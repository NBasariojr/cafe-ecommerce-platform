import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"
import { createHash } from "node:crypto"
import { AppError } from "./AppError"
import { jwtConfig } from "../config/jwt"
import type { UserRole } from "@cafe/shared"

export interface AccessTokenPayload {
  sub:   string
  email: string
  role:  UserRole
  jti:   string
  iat:   number
  exp:   number
}

export interface RefreshTokenPayload {
  sub: string
  jti: string
  iat: number
  exp: number
}

export interface TokenPair {
  accessToken:  string
  refreshToken: string
  accessJti:    string
  refreshJti:   string
}

// Generates a new access + refresh token pair.
// Each token carries a unique jti (JWT ID) for blacklisting and rotation.
export function generateTokens(
  userId: string,
  email:  string,
  role:   UserRole
): TokenPair {
  const accessJti  = uuid()
  const refreshJti = uuid()

  const accessToken = jwt.sign(
    { sub: userId, email, role, jti: accessJti } satisfies Omit<AccessTokenPayload, "iat" | "exp">,
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn }
  )

  const refreshToken = jwt.sign(
    { sub: userId, jti: refreshJti } satisfies Omit<RefreshTokenPayload, "iat" | "exp">,
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  )

  return { accessToken, refreshToken, accessJti, refreshJti }
}

// SHA-256 hash of a token string.
// Store this hash in Redis, not the raw token.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

// Verifies an access token signature and expiry.
// Throws AppError with ACCESS_TOKEN_INVALID for any JWT validation failure.
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, jwtConfig.accessSecret) as AccessTokenPayload
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "ACCESS_TOKEN_EXPIRED", "Access token has expired")
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, "ACCESS_TOKEN_INVALID", "Access token is invalid")
    }
    throw new AppError(401, "ACCESS_TOKEN_INVALID", "Access token verification failed")
  }
}

// Verifies a refresh token signature and expiry.
// Throws AppError with REFRESH_TOKEN_INVALID for any JWT validation failure.
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret) as RefreshTokenPayload
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token has expired")
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, "REFRESH_TOKEN_INVALID", "Refresh token is invalid")
    }
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Refresh token verification failed")
  }
}

// Returns the remaining lifetime of an access token in seconds.
// Used to set the TTL on the Redis blacklist key.
export function accessTokenRemainingSeconds(payload: AccessTokenPayload): number {
  return Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
}