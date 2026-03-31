import { z } from "zod"
import { CouponType } from "../enums"

export const CreateCouponSchema = z.object({
  code:           z.string().min(1).max(30).toUpperCase(),
  type:           z.nativeEnum(CouponType),
  value:          z.number().int().min(1),
  minOrderAmount: z.number().int().min(0).default(0),
  maxUsage:       z.number().int().min(1).optional(),
  perUserLimit:   z.number().int().min(1).default(1),
  description:    z.string().max(200).optional(),
  startsAt:       z.string().datetime().optional(),
  expiresAt:      z.string().datetime().optional(),
})

export const ValidateCouponSchema = z.object({
  code:       z.string().min(1),
  cartTotal:  z.number().int().min(0),
})

export const UpdateCouponSchema = CreateCouponSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateCouponInput   = z.infer<typeof CreateCouponSchema>
export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>
export type UpdateCouponInput   = z.infer<typeof UpdateCouponSchema>