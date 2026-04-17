import { AppError } from "../utils/AppError"
import { User } from "../models/user.model"
import {
  generateTokens,
  hashToken,
  verifyRefreshToken,
  accessTokenRemainingSeconds,
} from "../utils/token"
import { redisGet, redisSet, redisDel } from "../config/redis"
import { jwtConfig } from "../config/jwt"
import type { RegisterInput, LoginInput } from "@cafe/shared"
import type { SafeUserObject } from "../models/user.model"
import type { AccessTokenPayload } from "../utils/token"

export interface AuthResult {
  user:         SafeUserObject
  accessToken:  string
  refreshToken: string
}

export interface RefreshResult {
  accessToken:  string
  refreshToken: string
}

// Registers a new CUSTOMER account.
// Throws EMAIL_ALREADY_EXISTS if the email is taken.
// Password hashing is handled by the User model pre-save hook.
export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email.toLowerCase().trim() })
  if (existing) {
    throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists")
  }

  const user = await User.create({
    email:     input.email,
    password:  input.password,
    firstName: input.firstName,
    lastName:  input.lastName,
  })

  const tokens = generateTokens(user._id.toHexString(), user.email, user.role)
  await storeRefreshToken(user._id.toHexString(), tokens.refreshToken)

  // Cart merge stub — updated in Task 1-05 once Cart model exists.
  // Will become: await mergeCarts(sessionId, user._id.toHexString())

  return {
    user:         user.toSafeObject(),
    accessToken:  tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

// Authenticates an existing user by email and password.
// Uses findByEmail which explicitly selects the password field (select: false on schema).
// Always throws INVALID_CREDENTIALS on any failure — never reveals which field is wrong.
export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findByEmail(input.email)
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
  }

  const passwordMatch = await user.comparePassword(input.password)
  if (!passwordMatch) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
  }

  if (!user.isActive) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account has been disabled")
  }

  const tokens = generateTokens(user._id.toHexString(), user.email, user.role)
  await storeRefreshToken(user._id.toHexString(), tokens.refreshToken)

  // Cart merge stub — updated in Task 1-05 once Cart model exists.

  return {
    user:         user.toSafeObject(),
    accessToken:  tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

// Rotates a refresh token pair.
// Reads the incoming refresh token from the cookie (passed in by the controller).
// Validates the JWT, compares its hash against Redis, then issues a new pair.
//
// Reuse detection: if the incoming token does not match the stored hash, someone
// is trying to replay an old token. We delete the Redis key immediately to
// invalidate all sessions for this user, forcing a re-login.
export async function refreshTokens(incomingRefreshToken: string): Promise<RefreshResult> {
  // 1. Verify JWT signature and expiry
  const payload = verifyRefreshToken(incomingRefreshToken)

  const userId = payload.sub

  // 2. Compare hash against Redis
  const storedHash = await redisGet(`auth:refresh:${userId}`)
  if (!storedHash) {
    throw new AppError(401, "REFRESH_TOKEN_REVOKED", "Refresh token has been revoked")
  }

  if (storedHash !== hashToken(incomingRefreshToken)) {
    // Reuse detected — kill all sessions for this user immediately
    await redisDel(`auth:refresh:${userId}`)
    throw new AppError(401, "REFRESH_TOKEN_REVOKED", "Refresh token has been revoked")
  }

  // 3. Look up user to get current email and role
  // Refresh token payload only carries sub and jti — no email or role.
  // We do a DB lookup here because refresh is infrequent and we want
  // the new access token to carry the user's current role.
  const user = await User.findById(userId).lean()
  if (!user) {
    await redisDel(`auth:refresh:${userId}`)
    throw new AppError(401, "REFRESH_TOKEN_REVOKED", "User no longer exists")
  }

  // 4. Rotate: delete old key, issue new pair, store new hash
  await redisDel(`auth:refresh:${userId}`)
  const tokens = generateTokens(user._id.toHexString(), user.email, user.role)
  await storeRefreshToken(userId, tokens.refreshToken)

  return {
    accessToken:  tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

// Invalidates the current session.
// Blacklists the access token jti in Redis for its remaining lifetime.
// Deletes the refresh token hash from Redis.
// Cookie clearing is handled by the controller.
export async function logout(
  userId:        string,
  accessPayload: Pick<AccessTokenPayload, "jti" | "exp">
): Promise<void> {
  const remainingTTL = accessTokenRemainingSeconds(
    accessPayload as AccessTokenPayload
  )

  // Blacklist the jti so this access token cannot be used for its remaining lifetime.
  // TTL = remaining lifetime — the key expires itself, no cleanup needed.
  if (remainingTTL > 0) {
    await redisSet(`auth:blacklist:${accessPayload.jti}`, "1", remainingTTL)
  }

  // Delete the refresh token — future refresh attempts will fail.
  await redisDel(`auth:refresh:${userId}`)
}

// Stores a SHA-256 hash of the refresh token in Redis.
// Key: auth:refresh:{userId}  TTL: 7 days
// The hash (not the raw token) is stored to limit credential exposure.
async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  await redisSet(
    `auth:refresh:${userId}`,
    hashToken(refreshToken),
    jwtConfig.refreshTTLSeconds
  )
}