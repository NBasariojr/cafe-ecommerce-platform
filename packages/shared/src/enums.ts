export enum OrderStatus {
  PENDING   = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY     = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN    = "ADMIN",
}

export enum PaymentStatus {
  UNPAID   = "UNPAID",
  PAID     = "PAID",
  FAILED   = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum ProductStatus {
  ACTIVE       = "ACTIVE",
  INACTIVE     = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum PaymentProvider {
  PAYMONGO       = "PAYMONGO",
  CASH_ON_PICKUP = "CASH_ON_PICKUP",
}

export enum PaymentIntentStatus {
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  PAID             = "PAID",
  FAILED           = "FAILED",
}

export enum ReviewStatus {
  PENDING  = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum NotificationType {
  ORDER_UPDATE      = "ORDER_UPDATE",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  PROMOTION         = "PROMOTION",
  SYSTEM            = "SYSTEM",
}

export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED      = "FIXED",
}