// @cafe/shared - barrel export
// Always import from "@cafe/shared", never from subpaths.

// Enums
export * from "./enums"

// Domain interfaces
export type { Address, User, SafeUser }               from "./types/user"
export type { ProductVariant, Category, Product }     from "./types/product"
export type {
  OrderItemSnapshot,
  OrderItem,
  StatusHistoryEntry,
  OrderAddress,
  Order,
}                                                     from "./types/order"
export type { CartItem, AppliedCoupon, Cart }         from "./types/cart"
export type { Coupon }                                from "./types/coupon"
export type { Review, ReviewWithAuthor }              from "./types/review"
export type { Notification }                          from "./types/notification"
export type { PaymentRecord }                         from "./types/payment"

// Zod schemas and inferred types
export {
  RegisterSchema,
  LoginSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from "./schemas/auth.schemas"
export type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from "./schemas/auth.schemas"

export {
  ProductVariantSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "./schemas/product.schemas"
export type {
  ProductVariantInput,
  CreateProductInput,
  UpdateProductInput,
} from "./schemas/product.schemas"

export {
  AddToCartSchema,
  UpdateCartItemSchema,
  ApplyCouponSchema,
} from "./schemas/cart.schemas"
export type {
  AddToCartInput,
  UpdateCartItemInput,
  ApplyCouponInput,
} from "./schemas/cart.schemas"

export {
  OrderAddressSchema,
  PlaceOrderSchema,
  UpdateOrderStatusSchema,
  CancelOrderSchema,
} from "./schemas/order.schemas"
export type {
  OrderAddressInput,
  PlaceOrderInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
} from "./schemas/order.schemas"

export {
  CreateCouponSchema,
  ValidateCouponSchema,
  UpdateCouponSchema,
} from "./schemas/coupon.schemas"
export type {
  CreateCouponInput,
  ValidateCouponInput,
  UpdateCouponInput,
} from "./schemas/coupon.schemas"

export {
  CreatePaymentIntentSchema,
  PayMongoWebhookSchema,
} from "./schemas/payment.schemas"
export type {
  CreatePaymentIntentInput,
  PayMongoWebhookPayload,
} from "./schemas/payment.schemas"

export {
  CreateReviewSchema,
  ModerateReviewSchema,
} from "./schemas/review.schemas"
export type {
  CreateReviewInput,
  ModerateReviewInput,
} from "./schemas/review.schemas"

// Utility functions
export {
  formatCurrency,
  formatDate,
  calculateDiscount,
  truncateText,
} from "./utils/format"

export {
  slugify,
  generateOrderNumber,
  capitalize,
  initials,
} from "./utils/string"

// Constants
export { API_ROUTES, buildUrl } from "./constants/api.routes"
export { IPC_CHANNELS }         from "./constants/ipc"
export type { IpcChannel }      from "./constants/ipc"