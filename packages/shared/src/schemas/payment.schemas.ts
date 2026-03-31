import { z } from "zod"

export const CreatePaymentIntentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
})

// PayMongo webhook signature header format: t=TIMESTAMP,te=HASH,li=HASH
export const PayMongoWebhookSchema = z.object({
  data: z.object({
    id:         z.string(),
    type:       z.string(),
    attributes: z.object({
      amount:   z.number(),
      currency: z.string(),
      status:   z.string(),
      metadata: z
        .object({
          orderId:  z.string().optional(),
          platform: z.string().optional(),
        })
        .optional(),
      payments: z.array(z.unknown()).optional(),
    }),
  }),
})

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>
export type PayMongoWebhookPayload   = z.infer<typeof PayMongoWebhookSchema>