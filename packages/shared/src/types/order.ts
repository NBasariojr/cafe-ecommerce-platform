import type { OrderStatus, PaymentStatus, PaymentProvider } from "../enums"
import type { PaymentRecord } from "./payment"

/** Snapshot of a product variant at the time of purchase. Immutable after creation. */
export interface OrderItemSnapshot {
  productId:   string
  productName: string
  variantId:   string
  variantName: string
  sku:         string
  imageUrl?:   string
}

/**
 * A single line item inside an Order.
 * All prices are snapshots - they do not change if the product price changes later.
 */
export interface OrderItem {
  id:        string
  snapshot:  OrderItemSnapshot
  quantity:  number
  unitPrice: number
  subtotal:  number
}

/** A single entry in the order status history timeline. */
export interface StatusHistoryEntry {
  status:    OrderStatus
  timestamp: string
  note?:     string
}

/** Snapshot of the shipping address at time of order. Immutable after creation. */
export interface OrderAddress {
  street:   string
  city:     string
  province: string
  zipCode:  string
}

/**
 * A placed customer order.
 * orderNumber format: ORD-YYYYMMDD-XXXXX
 * All money fields are in centavos (integers).
 */
export interface Order {
  id:              string
  orderNumber:     string
  userId:          string
  items:           OrderItem[]
  status:          OrderStatus
  statusHistory:   StatusHistoryEntry[]
  shippingAddress: OrderAddress
  paymentMethod:   PaymentProvider
  paymentStatus:   PaymentStatus
  payment:         PaymentRecord
  subtotal:        number
  discountAmount:  number
  deliveryFee:     number
  total:           number
  couponCode?:     string
  notes?:          string
  estimatedReadyAt?: string
  cancelledAt?:    string
  createdAt:       string
  updatedAt:       string
}