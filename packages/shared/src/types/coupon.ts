import type { CouponType } from "../enums"

/**
 * A discount coupon.
 * PERCENTAGE type: value = percentage (1-100).
 * FIXED type: value = discount in centavos.
 * All amount fields are in centavos.
 */
export interface Coupon {
  id:             string
  code:           string
  type:           CouponType
  value:          number
  minOrderAmount: number
  maxUsage?:      number
  usageCount:     number
  perUserLimit:   number
  isActive:       boolean
  description?:   string
  startsAt?:      string
  expiresAt?:     string
  createdAt:      string
  updatedAt:      string
}