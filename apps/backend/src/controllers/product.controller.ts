import type { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { apiResponse } from "../utils/apiResponse"
import * as productService from "../services/product.service"

// POST /api/products  (admin)
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // Map categoryId to category field for Mongoose model
  const productData = {
    ...req.body,
    category: req.body.categoryId
  }
  delete productData.categoryId
  
  const product = await productService.createProduct(productData)
  res.status(201).json(apiResponse.success(product))
})

// GET /api/products  (public)
// Accepts: category, status, search, minPrice, maxPrice, sort, page, limit, featured
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query as productService.ProductListQuery)
  res.status(200).json(apiResponse.success(result))
})

// GET /api/products/:slug  (public)
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug)
  res.status(200).json(apiResponse.success(product))
})

// PUT /api/products/:id  (admin)
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  // Map categoryId to category field for Mongoose model
  const updateData = {
    ...req.body,
  }
  if (req.body.categoryId) {
    updateData.category = req.body.categoryId
    delete updateData.categoryId
  }
  
  const product = await productService.updateProduct(req.params.id, updateData)
  res.status(200).json(apiResponse.success(product))
})

// DELETE /api/products/:id  (admin — soft delete)
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.deleteProduct(req.params.id)
  res.status(200).json(
    apiResponse.success(product, "Product deactivated successfully")
  )
})

// PATCH /api/products/:id/status  (admin)
export const toggleProductStatus = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.toggleProductStatus(req.params.id)
  res.status(200).json(apiResponse.success(product))
})