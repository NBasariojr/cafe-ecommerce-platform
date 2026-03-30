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