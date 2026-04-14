import { Router } from "express"
import { getAllFlags } from "../config/featureFlags"
import { apiResponse } from "../utils/apiResponse"

const router: Router = Router()

// GET /api/flags
// Returns all feature flags and their current values
// This endpoint is always available, even during MAINTENANCE_MODE
router.get("/", (_req, res) => {
  res.json(apiResponse.success(getAllFlags()))
})

export { router as flagsRoutes }
