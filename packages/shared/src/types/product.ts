import type { ProductStatus } from "../enums"

/**
 * A single purchasable variant of a product.
 * Examples: small/medium/large, oat milk, iced.
 * priceModifier is in centavos and added to the product basePrice.
 */
export interface ProductVariant {
  id:            string
  name:          string
  sku:           string
  priceModifier: number
  stock:         number
  attributes:    Record<string, string>
}

/**
 * A product category - can be nested via parentId.
 * Example: Hot Drinks > Espresso-based
 */
export interface Category {
  id:           string
  name:         string
  slug:         string
  description?: string
  parentId?:    string
  imageUrl?:    string
  displayOrder: number
  isActive:     boolean
  children?:    Category[]
  createdAt:    string
  updatedAt:    string
}

/**
 * A menu item sold in the cafe.
 * basePrice is stored in centavos (integer) to avoid floating point errors.
 * Example: 15000 centavos = PHP 150.00
 */
export interface Product {
  id:               string
  name:             string
  slug:             string
  description:      string
  shortDescription: string
  basePrice:        number
  categoryId:       string
  category?:        Category
  variants:         ProductVariant[]
  imageUrls:        string[]
  status:           ProductStatus
  averageRating:    number
  reviewCount:      number
  tags:             string[]
  isFeatured:       boolean
  createdAt:        string
  updatedAt:        string
}