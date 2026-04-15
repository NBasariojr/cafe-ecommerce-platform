import type { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { apiResponse } from "../utils/apiResponse"
import * as authService from "../services/auth.service"
import { AppError } from "../utils/AppError"
import { jwtConfig } from "../config/jwt"
import { config } from "../config/index"

// Cookie options for setting the httpOnly refresh token.
// Scoped to /api/auth — the cookie is only sent on auth requests,
// not on every API call, which reduces header overhead and exposure.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   config.isProd,
  sameSite: "strict" as const,
  maxAge:   jwtConfig.refreshTTLSeconds * 1000,
  path:     "/api/auth",
}

// Cookie options for clearing the refresh token.
// Must use the same path as the set options — otherwise the browser
// cannot find the cookie to remove it.
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   config.isProd,
  sameSite: "strict" as const,
  path:     "/api/auth",
}

// POST /api/auth/register
// Body: { email, password, firstName, lastName }
// Response: { user: SafeUser, accessToken }
// Sets httpOnly refresh token cookie.
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body)
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)
  res.status(201).json(
    apiResponse.success({ user: result.user, accessToken: result.accessToken })
  )
})

// POST /api/auth/login
// Body: { email, password }
// Response: { user: SafeUser, accessToken }
// Sets httpOnly refresh token cookie.
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body)
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)
  res.status(200).json(
    apiResponse.success({ user: result.user, accessToken: result.accessToken })
  )
})

// POST /api/auth/refresh
// No Authorization header — reads refresh token from httpOnly cookie.
// Issues a new access + refresh token pair (rotation).
// Sets new refresh token cookie, returns new accessToken in body.
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies.refreshToken as string | undefined
  if (!incomingToken) {
    throw new AppError(401, "REFRESH_TOKEN_MISSING", "Refresh token cookie is missing")
  }

  const result = await authService.refreshTokens(incomingToken)

  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)
  res.status(200).json(
    apiResponse.success({ accessToken: result.accessToken })
  )
})

// POST /api/auth/logout
// Requires: authenticate middleware (reads jti and exp from req.user).
// Blacklists the access token jti, deletes the refresh token from Redis,
// and clears the refresh cookie.
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "TOKEN_MISSING", "Authentication required")
  }

  await authService.logout(req.user.id, {
    jti: req.user.jti,
    exp: req.user.exp,
  })

  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS)
  res.status(200).json(
    apiResponse.success({ message: "Logged out successfully" })
  )
})

// GET /api/auth/me
// Requires: authenticate middleware.
// Returns the decoded token payload — no database call.
// Use /api/users/profile (Task users routes) for the full user object.
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "TOKEN_MISSING", "Authentication required")
  }
  res.status(200).json(
    apiResponse.success({
      id:    req.user.id,
      email: req.user.email,
      role:  req.user.role,
    })
  )
})