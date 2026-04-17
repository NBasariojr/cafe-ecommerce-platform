import { Router } from "express"
import { authenticate } from "../middleware/authenticate"
import { authorize } from "../middleware/authorize"
import { validate } from "../middleware/validate"
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../controllers/product.controller"
import { CreateProductSchema, UpdateProductSchema, UserRole } from "@cafe/shared"

const router: Router = Router()

// Public routes — no authentication required
router.get("/",      getProducts)
router.get("/:slug", getProductBySlug)

// Admin routes — token + ADMIN role required on all write operations
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(CreateProductSchema),
  createProduct
)

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(UpdateProductSchema),
  updateProduct
)

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  deleteProduct
)

router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.ADMIN),
  toggleProductStatus
)

export { router as productRoutes }