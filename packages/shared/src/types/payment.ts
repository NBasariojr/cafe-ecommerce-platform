import type { PaymentProvider, PaymentStatus } from "../enums"

/**
 * Embedded payment record on an Order.
 * Populated after PayMongo processes the payment or on Cash on Pickup confirmation.
 */
export interface PaymentRecord {
  provider:  PaymentProvider
  intentId?: string
  status:    PaymentStatus
  amount:    number
  paidAt?:   string
}