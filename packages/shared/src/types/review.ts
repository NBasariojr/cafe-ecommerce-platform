import type { ReviewStatus } from "../enums"

/**
 * A product review written by a verified purchaser.
 * Only reviews with status APPROVED are shown publicly.
 * A user can only review a product they have purchased (COMPLETED order).
 */
export interface Review {
  id:        string
  userId:    string
  productId: string
  orderId:   string
  rating:    1 | 2 | 3 | 4 | 5
  comment?:  string
  status:    ReviewStatus
  adminNote?: string
  createdAt: string
  updatedAt: string
}

/** Review with author name populated - returned in public product review lists. */
export interface ReviewWithAuthor extends Review {
  authorFirstName: string
  authorLastName:  string
}