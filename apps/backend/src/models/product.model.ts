import mongoose, { Document, Model, Schema } from "mongoose"
import { ProductStatus, slugify } from "@cafe/shared"

export interface IProductVariant {
  _id:           mongoose.Types.ObjectId
  name:          string
  sku:           string
  priceModifier: number
  stock:         number
  attributes:    Map<string, string>
}

export interface IProduct extends Document {
  _id:              mongoose.Types.ObjectId
  name:             string
  slug:             string
  description:      string
  shortDescription: string
  basePrice:        number
  category:         mongoose.Types.ObjectId
  variants:         mongoose.Types.DocumentArray<IProductVariant & Document>
  imageUrls:        string[]
  status:           ProductStatus
  averageRating:    number
  reviewCount:      number
  tags:             string[]
  isFeatured:       boolean
  createdAt:        Date
  updatedAt:        Date
}

export interface IProductModel extends Model<IProduct> {
  findBySlug(slug: string): Promise<IProduct | null>
}

const VariantSchema = new Schema<IProductVariant>(
  {
    name:          { type: String, required: true, trim: true, maxlength: 80 },
    sku:           { type: String, required: true, trim: true, maxlength: 50 },
    priceModifier: {
      type:    Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message:   "priceModifier must be an integer (centavos)",
      },
    },
    stock: {
      type:    Number,
      default: 0,
      min:     [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message:   "Stock must be an integer",
      },
    },
    attributes: { type: Map, of: String, default: {} },
  },
  { _id: true }
)

const ProductSchema = new Schema<IProduct, IProductModel>(
  {
    name: {
      type:      String,
      required:  [true, "Product name is required"],
      trim:      true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type:   String,
      unique: true,
      trim:   true,
      index:  true,
    },
    description:      { type: String, default: "", maxlength: 2000 },
    shortDescription: { type: String, default: "", maxlength: 300 },
    basePrice: {
      type:     Number,
      required: [true, "Base price is required"],
      min:      [0, "Base price cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message:   "basePrice must be an integer (centavos, e.g. 15000 = ₱150.00)",
      },
    },
    category: {
      type:     Schema.Types.ObjectId,
      ref:      "Category",
      required: [true, "Category is required"],
      index:    true,
    },
    variants:      { type: [VariantSchema], default: [] },
    imageUrls:     { type: [String], default: [] },
    status: {
      type:    String,
      enum:    Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0, min: 0 },
    tags:          { type: [String], default: [] },
    isFeatured:    { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Text index for full-text search across name, tags, and description.
// Weights control relevance ranking: name matches rank highest.
ProductSchema.index(
  { name: "text", description: "text", tags: "text" },
  { weights: { name: 5, tags: 3, description: 1 }, name: "product_text_idx" }
)

// Compound index for the most common public query pattern.
ProductSchema.index({ category: 1, status: 1 })

// Pre-save hook: auto-generate slug from name.
// Only runs when name is modified to avoid unnecessary DB writes.
// Collision handling: appended suffix if the base slug is already taken.
ProductSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next()

  const baseSlug = slugify(this.name)
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const existing = await (this.constructor as IProductModel).findOne({
      slug,
      _id: { $ne: this._id },
    })
    if (!existing) break
    slug = `${baseSlug}-${suffix}`
    suffix++
  }

  this.slug = slug
  next()
})

// Static method: fetch a single product by slug with category populated.
ProductSchema.statics.findBySlug = function (slug: string): Promise<IProduct | null> {
  return this.findOne({ slug }).populate("category", "name slug").exec()
}

export const Product = (mongoose.models.Product ??
  mongoose.model<IProduct, IProductModel>("Product", ProductSchema)) as IProductModel