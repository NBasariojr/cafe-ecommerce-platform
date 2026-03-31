import { z } from "zod"
import { ProductStatus } from "../enums"

export const ProductVariantSchema = z.object({
  name:          z.string().min(1).max(80),
  sku:           z.string().min(1).max(50),
  priceModifier: z.number().int("Must be an integer (centavos)"),
  stock:         z.number().int().min(0, "Stock cannot be negative"),
  attributes:    z.record(z.string(), z.string()).default({}),
})

export const CreateProductSchema = z.object({
  name:             z.string().min(1, "Name is required").max(100),
  description:      z.string().max(2000).default(""),
  shortDescription: z.string().max(300).default(""),
  basePrice:        z.number().int("Must be an integer (centavos)").min(0),
  categoryId:       z.string().min(1, "Category is required"),
  variants:         z.array(ProductVariantSchema).min(1, "At least one variant is required"),
  imageUrls:        z.array(z.string().url()).default([]),
  status:           z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  tags:             z.array(z.string()).default([]),
  isFeatured:       z.boolean().default(false),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export type ProductVariantInput  = z.infer<typeof ProductVariantSchema>
export type CreateProductInput   = z.infer<typeof CreateProductSchema>
export type UpdateProductInput   = z.infer<typeof UpdateProductSchema>