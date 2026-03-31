import { z } from "zod"
import { PaymentProvider, OrderStatus } from "../enums"

export const OrderAddressSchema = z.object({
  street:   z.string().min(1, "Street is required").max(200),
  city:     z.string().min(1, "City is required").max(100),
  province: z.string().min(1, "Province is required").max(100),
  zipCode:  z.string().min(4, "Zip code must be at least 4 characters").max(10),
})

export const PlaceOrderSchema = z.object({
  cartId:        z.string().min(1, "Cart ID is required"),
  address:       OrderAddressSchema,
  couponCode:    z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentProvider),
  notes:         z.string().max(500).optional(),
})

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note:   z.string().max(500).optional(),
})

export const CancelOrderSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(500),
})

export type OrderAddressInput       = z.infer<typeof OrderAddressSchema>
export type PlaceOrderInput         = z.infer<typeof PlaceOrderSchema>
export type UpdateOrderStatusInput  = z.infer<typeof UpdateOrderStatusSchema>
export type CancelOrderInput        = z.infer<typeof CancelOrderSchema>