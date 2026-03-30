/**
 * A single item in the shopping cart.
 * unitPrice is snapshotted when the item is added, not recalculated live.
 * This is intentionally different from OrderItem - the cart is mutable.
 */
export interface CartItem {
  id:        string
  productId: string
  variantId: string
  quantity:  number
  unitPrice: number
  subtotal:  number
}

/** Coupon applied to a cart - stores a snapshot of the discount for display. */
export interface AppliedCoupon {
  code:           string
  type:           "PERCENTAGE" | "FIXED"
  value:          number
  discountAmount: number
}

/**
 * A shopping cart.
 * Either userId (authenticated) or sessionId (guest) must be present.
 * Guest carts are merged into the user cart on login.
 */
export interface Cart {
  id:          string
  userId?:     string
  sessionId?:  string
  items:       CartItem[]
  coupon?:     AppliedCoupon
  totalAmount: number
  itemCount:   number
  createdAt:   string
  updatedAt:   string
}