import type { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { apiResponse } from "../utils/apiResponse"
import * as authService from "../services/auth.service"
import { jwtConfig } from "../config/jwt"
import { config } from "../config/index"

// Cookie options for the httpOnly refresh token.
// Path is scoped to /api/auth so the cookie is not sent on every request —
// only when the client explicitly calls /api/auth/refresh or /api/auth/logout.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    config.isProd,
  sameSite:  "strict" as const,
  maxAge:    jwtConfig.refreshTTLSeconds * 1000,
  path:      "/api/auth",
}

// POST /api/auth/register
// Body: { email, password, firstName, lastName }
// Response: { user: SafeUser, accessToken }
// Sets refresh token in httpOnly cookie.
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body)

  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)

  res.status(201).json(
    apiResponse.success({
      user:        result.user,
      accessToken: result.accessToken,
    })
  )
})

// POST /api/auth/login
// Body: { email, password }
// Response: { user: SafeUser, accessToken }
// Sets refresh token in httpOnly cookie.
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body)

  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)

  res.status(200).json(
    apiResponse.success({
      user:        result.user,
      accessToken: result.accessToken,
    })
  )
})