import { config } from "./index"

// Feature flags for the CafeBrew platform
// All flags default to true in development, can be overridden by environment variables
// Format: FEATURE_FLAG_NAME=false (string "false" disables, anything else enables)

const DEFAULT_FLAGS = {
  PAYMENTS_ENABLED: true,
  LOYALTY_POINTS_ENABLED: true,
  REVIEWS_ENABLED: true,
  PROMOTIONS_ENABLED: true,
  MAINTENANCE_MODE: false,
} as const

type FlagName = keyof typeof DEFAULT_FLAGS

/**
 * Get the value of a feature flag
 * @param flag - The flag name to check
 * @returns true if the flag is enabled, false otherwise
 */
export function getFlag(flag: FlagName): boolean {
  const envKey = `FEATURE_${flag}`
  const envValue = config.nodeEnv === "production" ? process.env[envKey] : undefined
  
  // If explicitly set to "false" in production env, disable it
  if (envValue === "false") return false
  
  // Otherwise use the default
  return DEFAULT_FLAGS[flag]
}

/**
 * Get all feature flags and their current values
 * @returns Object with all flag names and their boolean values
 */
export function getAllFlags(): Record<FlagName, boolean> {
  const flags: Record<FlagName, boolean> = {} as Record<FlagName, boolean>
  
  for (const flag of Object.keys(DEFAULT_FLAGS) as FlagName[]) {
    flags[flag] = getFlag(flag)
  }
  
  return flags
}

export { FlagName }
