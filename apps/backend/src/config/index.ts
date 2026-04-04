import { z } from "zod"

// Validates all required environment variables at process startup.
// If any are missing or invalid the server refuses to start with a clear message.
// Never access process.env directly outside this file — always use config.*.
const envSchema = z.object({
  PORT:                     z.string().default("3000"),
  NODE_ENV:                 z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN:              z.string().min(1),
  MONGODB_URI:              z.string().min(1),
  REDIS_URL:                z.string().min(1),
  JWT_ACCESS_SECRET:        z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET:       z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  PAYMONGO_SECRET_KEY:      z.string().min(1),
  PAYMONGO_WEBHOOK_SECRET:  z.string().min(1),
  SUPABASE_URL:             z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_KEY:             z.string().min(1),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  const missing = Object.keys(result.error.flatten().fieldErrors)
  console.error("\n[Config] Server cannot start — missing or invalid environment variables:")
  missing.forEach((key) => {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>
    const errors = fieldErrors[key]
    console.error(`  - ${key}: ${errors?.join(", ")}`)
  })
  console.error("\n  Copy apps/backend/.env.example to apps/backend/.env and fill in all values.\n")
  process.exit(1)
}

export const config = {
  port:     parseInt(result.data.PORT, 10),
  nodeEnv:  result.data.NODE_ENV,
  isDev:    result.data.NODE_ENV === "development",
  isProd:   result.data.NODE_ENV === "production",
  isTest:   result.data.NODE_ENV === "test",

  cors: {
    origins: result.data.CORS_ORIGIN.split(",").map((o) => o.trim()),
  },

  db: {
    mongoUri: result.data.MONGODB_URI,
    redisUrl: result.data.REDIS_URL,
  },

  jwt: {
    accessSecret:  result.data.JWT_ACCESS_SECRET,
    refreshSecret: result.data.JWT_REFRESH_SECRET,
  },

  payMongo: {
    secretKey:     result.data.PAYMONGO_SECRET_KEY,
    webhookSecret: result.data.PAYMONGO_WEBHOOK_SECRET,
  },

  supabase: {
    url: result.data.SUPABASE_URL,
    key: result.data.SUPABASE_KEY,
  },
} as const