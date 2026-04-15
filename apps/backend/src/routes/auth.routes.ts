import { Router } from "express"
import { validate } from "../middleware/validate"
import { authenticate } from "../middleware/authenticate"
import { register, login, refresh, logout, me } from "../controllers/auth.controller"
import { RegisterSchema, LoginSchema } from "@cafe/shared"

const router: Router = Router()

// Public routes — no token required
router.post("/register", validate(RegisterSchema), register)
router.post("/login",    validate(LoginSchema),    login)

// Cookie-based route — reads httpOnly cookie, NOT an Authorization header.
// Do NOT add authenticate middleware here.
router.post("/refresh", refresh)

// Protected routes — access token required in Authorization header
router.post("/logout", authenticate, logout)
router.get("/me",      authenticate, me)

export { router as authRoutes }