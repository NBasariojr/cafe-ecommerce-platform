import { config } from "./index"

export const jwtConfig = {
  accessSecret:       config.jwt.accessSecret,
  refreshSecret:      config.jwt.refreshSecret,
  accessExpiresIn:    "15m",
  refreshExpiresIn:   "7d",
  refreshTTLSeconds:  7 * 24 * 60 * 60,
} as const