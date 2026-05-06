import mongoose, { Document, Model, Schema } from "mongoose"
import { slugify } from "@cafe/shared"

export interface ICategory extends Document {
  _id:         mongoose.Types.ObjectId
  name:         string
  slug:         string
  description?:  string
  imageUrls?:   string[]
  isActive:     boolean
  createdAt:     Date
  updatedAt:     Date
}

export interface ICategoryModel extends Model<ICategory> {
  findBySlug(slug: string): Promise<ICategory | null>
}

const CategorySchema = new Schema<ICategory, ICategoryModel>(
  {
    name:         { type: String, required: true, trim: true, maxlength: 100 },
    slug:         { type: String, required: true, unique: true, trim: true, index: true },
    description:  { type: String, default: "", maxlength: 500 },
    imageUrls:    { type: [String], default: [] },
    isActive:     { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Pre-save hook: auto-generate slug from name
CategorySchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next()

  const baseSlug = slugify(this.name)
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const existing = await (this.constructor as ICategoryModel).findOne({
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

// Static method: fetch a single category by slug
CategorySchema.statics.findBySlug = function (slug: string): Promise<ICategory | null> {
  return this.findOne({ slug }).exec()
}

export const Category = (mongoose.models.Category ??
  mongoose.model<ICategory, ICategoryModel>("Category", CategorySchema)) as ICategoryModel
