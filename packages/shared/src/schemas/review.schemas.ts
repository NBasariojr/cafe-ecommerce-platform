import { z } from "zod"
import { ReviewStatus } from "../enums"

export const CreateReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating:    z.number().int().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  comment:   z.string().max(1000).optional(),
})

export const ModerateReviewSchema = z.object({
  status:    z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED]),
  adminNote: z.string().max(500).optional(),
})

export type CreateReviewInput   = z.infer<typeof CreateReviewSchema>
export type ModerateReviewInput = z.infer<typeof ModerateReviewSchema>