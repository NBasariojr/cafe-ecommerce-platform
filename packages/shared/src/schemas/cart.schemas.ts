import { z } from "zod"

export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  quantity:  z.number().int().min(1, "Minimum quantity is 1").max(99, "Maximum quantity is 99"),
})

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative").max(99),
})

export const ApplyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
})

export type AddToCartInput      = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type ApplyCouponInput    = z.infer<typeof ApplyCouponSchema>