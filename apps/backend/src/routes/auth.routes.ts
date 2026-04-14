import { Router } from "express"
import { validate } from "../middleware/validate"
import { register, login } from "../controllers/auth.controller"
import { RegisterSchema, LoginSchema } from "@cafe/shared"

const router: Router = Router()

// POST /api/auth/register
router.post("/register", validate(RegisterSchema), register)

// POST /api/auth/login
router.post("/login", validate(LoginSchema), login)

// Task 1-03 adds: POST /refresh, POST /logout, GET /me

export { router as authRoutes }