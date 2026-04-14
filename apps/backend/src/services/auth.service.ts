import { AppError } from "../utils/AppError"
import { User } from "../models/user.model"
import { generateTokens, hashToken } from "../utils/token"
import { redisSet } from "../config/redis"
import { jwtConfig } from "../config/jwt"
import type { RegisterInput, LoginInput } from "@cafe/shared"
import type { SafeUserObject } from "../models/user.model"

export interface AuthResult {
  user:        SafeUserObject
  accessToken: string
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

  const userId = user._id.toHexString()
  const tokens = generateTokens(userId, user.email, user.role)
  await storeRefreshToken(userId, tokens.refreshToken)

  // Cart merge: no-op until Task 1-05 (Cart model) is built.
  // auth.service.ts will be updated then to call mergeCarts(sessionId, userId).

  return {
    user:         user.toSafeObject(),
    accessToken:  tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

// Authenticates an existing user by email and password.
// Uses findByEmail which explicitly selects the password field (select: false on schema).
// Throws INVALID_CREDENTIALS on any mismatch — never reveals which field is wrong.
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

  const userId = user._id.toHexString()
  const tokens = generateTokens(userId, user.email, user.role)
  await storeRefreshToken(userId, tokens.refreshToken)

  return {
    user:         user.toSafeObject(),
    accessToken:  tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

// Stores a SHA-256 hash of the refresh token in Redis.
// Key: auth:refresh:{userId}  TTL: 7 days
// The hash (not the raw token) is stored to protect credentials at rest.
async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  await redisSet(
    `auth:refresh:${userId}`,
    hashToken(refreshToken),
    jwtConfig.refreshTTLSeconds
  )
}