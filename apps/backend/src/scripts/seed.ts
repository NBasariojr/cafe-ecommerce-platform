// MongoDB seed script for local development.
// Populates the database with realistic cafe data for testing.
//
// Run: pnpm seed (from apps/backend/)
// Requires: MongoDB running (make dev), .env configured
//
// SAFETY: Refuses to run if NODE_ENV is "production".
// IDEMPOTENT: Drops all collections before re-seeding.

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "node:path"

// Load env vars from apps/backend/.env
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

// Production guard — hardest stop
if (process.env.NODE_ENV === "production") {
  console.error("[Seed] Refusing to run in production. NODE_ENV=production detected.")
  process.exit(1)
}

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("[Seed] MONGODB_URI is not set. Check apps/backend/.env.")
  process.exit(1)
}

// =============================================================================
// Data definitions
// =============================================================================

// All prices in centavos (PHP). 15000 = ₱150.00
const ADMIN_EMAIL    = "admin@cafe.com"
const ADMIN_PASSWORD = "Admin@12345"

const categories = [
  { name: "Hot Drinks",   slug: "hot-drinks",   displayOrder: 1, description: "Espresso-based and brewed hot beverages" },
  { name: "Cold Drinks",  slug: "cold-drinks",  displayOrder: 2, description: "Iced coffees, blended drinks, and cold brew" },
  { name: "Pastries",     slug: "pastries",     displayOrder: 3, description: "Freshly baked goods and light snacks" },
  { name: "Merchandise",  slug: "merchandise",  displayOrder: 4, description: "Branded mugs, tumblers, and bags" },
]

// Helper to build size variants (centavos)
function sizeVariants(small: number, medium: number, large: number) {
  return [
    { name: "Small",  sku: "SZ-S", priceModifier: 0,             stock: 100, attributes: { size: "Small" } },
    { name: "Medium", sku: "SZ-M", priceModifier: medium - small, stock: 100, attributes: { size: "Medium" } },
    { name: "Large",  sku: "SZ-L", priceModifier: large - small,  stock: 100, attributes: { size: "Large" } },
  ]
}

// Products are defined after categories are seeded so categoryId can be assigned
function buildProducts(categoryMap: Record<string, string>) {
  return [
    // Hot Drinks (3)
    {
      name: "Americano",
      slug: "americano",
      description: "Espresso shots with hot water. Bold, clean, and straightforward.",
      shortDescription: "Classic black coffee",
      basePrice: 10000,
      categoryId: categoryMap["hot-drinks"],
      variants: sizeVariants(10000, 11500, 13000),
      tags: ["coffee", "espresso", "black"],
      isFeatured: false,
    },
    {
      name: "Café Latte",
      slug: "cafe-latte",
      description: "Smooth espresso with steamed milk and a thin layer of foam.",
      shortDescription: "Espresso with steamed milk",
      basePrice: 13500,
      categoryId: categoryMap["hot-drinks"],
      variants: [
        ...sizeVariants(13500, 15000, 17000),
        { name: "Oat Milk", sku: "LT-OAT", priceModifier: 2500, stock: 80, attributes: { milk: "Oat" } },
      ],
      tags: ["coffee", "latte", "milk"],
      isFeatured: true,
    },
    {
      name: "Cappuccino",
      slug: "cappuccino",
      description: "Equal parts espresso, steamed milk, and foam. A perfect balance.",
      shortDescription: "Classic Italian espresso drink",
      basePrice: 13000,
      categoryId: categoryMap["hot-drinks"],
      variants: sizeVariants(13000, 14500, 16000),
      tags: ["coffee", "espresso", "foam"],
      isFeatured: false,
    },

    // Cold Drinks (3)
    {
      name: "Iced Americano",
      slug: "iced-americano",
      description: "Espresso over ice. Clean and refreshing.",
      shortDescription: "Chilled black coffee over ice",
      basePrice: 11000,
      categoryId: categoryMap["cold-drinks"],
      variants: sizeVariants(11000, 12500, 14500),
      tags: ["iced", "coffee", "espresso"],
      isFeatured: false,
    },
    {
      name: "Iced Caramel Macchiato",
      slug: "iced-caramel-macchiato",
      description: "Vanilla syrup, cold milk, espresso, and caramel drizzle over ice.",
      shortDescription: "Layered iced espresso with caramel",
      basePrice: 17000,
      categoryId: categoryMap["cold-drinks"],
      variants: [
        ...sizeVariants(17000, 19000, 21000),
        { name: "Oat Milk", sku: "ICM-OAT", priceModifier: 2500, stock: 60, attributes: { milk: "Oat" } },
        { name: "Almond Milk", sku: "ICM-ALM", priceModifier: 3000, stock: 40, attributes: { milk: "Almond" } },
      ],
      tags: ["iced", "caramel", "latte", "popular"],
      isFeatured: true,
    },
    {
      name: "Cold Brew",
      slug: "cold-brew",
      description: "Coffee steeped in cold water for 18 hours. Smooth and naturally sweet.",
      shortDescription: "Slow-steeped cold coffee",
      basePrice: 18000,
      categoryId: categoryMap["cold-drinks"],
      variants: sizeVariants(18000, 20000, 22000),
      tags: ["cold brew", "coffee", "smooth"],
      isFeatured: true,
    },

    // Pastries (3)
    {
      name: "Butter Croissant",
      slug: "butter-croissant",
      description: "Flaky, golden, and buttery. Baked fresh daily.",
      shortDescription: "Freshly baked flaky pastry",
      basePrice: 9500,
      categoryId: categoryMap["pastries"],
      variants: [
        { name: "Plain", sku: "CRO-PLN", priceModifier: 0,    stock: 30, attributes: { type: "Plain" } },
        { name: "Almond", sku: "CRO-ALM", priceModifier: 2000, stock: 20, attributes: { type: "Almond" } },
      ],
      tags: ["pastry", "croissant", "breakfast"],
      isFeatured: false,
    },
    {
      name: "Blueberry Muffin",
      slug: "blueberry-muffin",
      description: "Moist muffin loaded with fresh blueberries and topped with sugar crystals.",
      shortDescription: "Classic muffin with fresh blueberries",
      basePrice: 8500,
      categoryId: categoryMap["pastries"],
      variants: [
        { name: "Regular", sku: "MUF-BLU", priceModifier: 0, stock: 25, attributes: {} },
      ],
      tags: ["muffin", "blueberry", "sweet"],
      isFeatured: false,
    },
    {
      name: "Banana Loaf",
      slug: "banana-loaf",
      description: "Dense, moist banana bread with walnuts. A house favourite.",
      shortDescription: "Moist banana bread with walnuts",
      basePrice: 9000,
      categoryId: categoryMap["pastries"],
      variants: [
        { name: "Slice",     sku: "BAN-SLI", priceModifier: 0,    stock: 20, attributes: { size: "Slice" } },
        { name: "Whole Loaf", sku: "BAN-WHL", priceModifier: 30000, stock: 5, attributes: { size: "Whole" } },
      ],
      tags: ["bread", "banana", "nuts"],
      isFeatured: false,
    },

    // Merchandise (3)
    {
      name: "Cafe Logo Mug",
      slug: "cafe-logo-mug",
      description: "Ceramic mug with the cafe logo. Dishwasher safe.",
      shortDescription: "Branded ceramic coffee mug",
      basePrice: 45000,
      categoryId: categoryMap["merchandise"],
      variants: [
        { name: "300ml", sku: "MUG-300", priceModifier: 0,     stock: 50, attributes: { size: "300ml" } },
        { name: "450ml", sku: "MUG-450", priceModifier: 10000, stock: 30, attributes: { size: "450ml" } },
      ],
      tags: ["mug", "merchandise", "gift"],
      isFeatured: false,
    },
    {
      name: "Canvas Tote Bag",
      slug: "canvas-tote-bag",
      description: "Natural canvas tote with the cafe logo. Holds up to 10 kg.",
      shortDescription: "Branded canvas shopping bag",
      basePrice: 35000,
      categoryId: categoryMap["merchandise"],
      variants: [
        { name: "Natural", sku: "TOT-NAT", priceModifier: 0, stock: 40, attributes: { color: "Natural" } },
      ],
      tags: ["tote", "bag", "merchandise"],
      isFeatured: false,
    },
    {
      name: "Stainless Tumbler",
      slug: "stainless-tumbler",
      description: "Double-walled stainless steel tumbler. Keeps drinks cold for 24h, hot for 12h.",
      shortDescription: "Insulated stainless coffee tumbler",
      basePrice: 85000,
      categoryId: categoryMap["merchandise"],
      variants: [
        { name: "Black",  sku: "TUM-BLK", priceModifier: 0,    stock: 20, attributes: { color: "Black" } },
        { name: "White",  sku: "TUM-WHT", priceModifier: 0,    stock: 20, attributes: { color: "White" } },
        { name: "Forest", sku: "TUM-GRN", priceModifier: 5000, stock: 10, attributes: { color: "Forest Green" } },
      ],
      tags: ["tumbler", "merchandise", "gift"],
      isFeatured: true,
    },
  ]
}

const coupons = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE" as const,
    value: 10,
    minOrderAmount: 0,
    maxUsage: null,
    usageCount: 0,
    perUserLimit: 1,
    isActive: true,
    description: "10% off your first order",
  },
  {
    code: "BIGORDER",
    type: "FIXED" as const,
    value: 5000, // ₱50.00
    minOrderAmount: 50000, // ₱500.00
    maxUsage: 100,
    usageCount: 0,
    perUserLimit: 3,
    isActive: true,
    description: "₱50 off orders ₱500 and above",
  },
]

// =============================================================================
// Inline Mongoose schemas (Phase 1 models do not exist yet)
// Once Phase 1 models exist, this script can import from models/ directly.
// =============================================================================

const AddressSchema = new mongoose.Schema({
  label:     String,
  street:    String,
  city:      String,
  province:  String,
  zipCode:   String,
  isDefault: Boolean,
})

const UserSchema = new mongoose.Schema(
  {
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true },
    firstName:     { type: String, required: true },
    lastName:      { type: String, required: true },
    role:          { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    isActive:      { type: Boolean, default: true },
    addresses:     [AddressSchema],
    loyaltyPoints: { type: Number, default: 0 },
    pushTokens:    [String],
  },
  { timestamps: true }
)

const CategorySchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    slug:         { type: String, required: true, unique: true },
    description:  String,
    parentId:     mongoose.Schema.Types.ObjectId,
    imageUrl:     String,
    displayOrder: { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
)

const VariantSchema = new mongoose.Schema({
  name:          String,
  sku:           String,
  priceModifier: { type: Number, default: 0 },
  stock:         { type: Number, default: 0 },
  attributes:    { type: Map, of: String },
})

const ProductSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true },
    slug:             { type: String, required: true, unique: true },
    description:      String,
    shortDescription: String,
    basePrice:        { type: Number, required: true },
    categoryId:       { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    variants:         [VariantSchema],
    imageUrls:        [String],
    status:           { type: String, enum: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"], default: "ACTIVE" },
    averageRating:    { type: Number, default: 0 },
    reviewCount:      { type: Number, default: 0 },
    tags:             [String],
    isFeatured:       { type: Boolean, default: false },
  },
  { timestamps: true }
)

const CouponSchema = new mongoose.Schema(
  {
    code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:           { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    value:          { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUsage:       { type: Number, default: null },
    usageCount:     { type: Number, default: 0 },
    perUserLimit:   { type: Number, default: 1 },
    isActive:       { type: Boolean, default: true },
    description:    String,
    startsAt:       Date,
    expiresAt:      Date,
  },
  { timestamps: true }
)

// =============================================================================
// Seed runner
// =============================================================================

async function seed() {
  console.log("[Seed] Connecting to MongoDB...")
  await mongoose.connect(MONGODB_URI!)
  console.log("[Seed] Connected.")

  const db = mongoose.connection.db!

  // Models — use inline schemas defined above
  const User     = mongoose.models.User     ?? mongoose.model("User",     UserSchema)
  const Category = mongoose.models.Category ?? mongoose.model("Category", CategorySchema)
  const Product  = mongoose.models.Product  ?? mongoose.model("Product",  ProductSchema)
  const Coupon   = mongoose.models.Coupon   ?? mongoose.model("Coupon",   CouponSchema)

  // Drop all collections for a clean slate
  console.log("[Seed] Dropping existing collections...")
  const collections = await db.listCollections().toArray()
  for (const col of collections) {
    await db.dropCollection(col.name)
  }
  console.log("[Seed] Collections dropped.")

  // 1. Admin user
  console.log("[Seed] Seeding admin user...")
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await User.create({
    email:     ADMIN_EMAIL,
    password:  hashedPassword,
    firstName: "Cafe",
    lastName:  "Admin",
    role:      "ADMIN",
    isActive:  true,
  })
  console.log(`[Seed]   Admin: ${ADMIN_EMAIL}`)

  // 2. Customer users
  console.log("[Seed] Seeding customer users...")
  const customers = [
    { firstName: "Juan",   lastName: "Dela Cruz",   email: "juan@example.com" },
    { firstName: "Maria",  lastName: "Santos",      email: "maria@example.com" },
    { firstName: "Jose",   lastName: "Reyes",       email: "jose@example.com" },
    { firstName: "Ana",    lastName: "Garcia",      email: "ana@example.com" },
    { firstName: "Carlos", lastName: "Mendoza",     email: "carlos@example.com" },
  ]
  const customerPass = await bcrypt.hash("Customer@123", 10)
  for (const c of customers) {
    await User.create({ ...c, password: customerPass, role: "CUSTOMER", isActive: true })
    console.log(`[Seed]   Customer: ${c.email}`)
  }

  // 3. Categories
  console.log("[Seed] Seeding categories...")
  const createdCategories = await Category.insertMany(categories)
  const categoryMap: Record<string, string> = {}
  for (const cat of createdCategories) {
    categoryMap[cat.slug] = cat._id.toString()
    console.log(`[Seed]   Category: ${cat.name}`)
  }

  // 4. Products
  console.log("[Seed] Seeding products...")
  const productData = buildProducts(categoryMap)
  for (const p of productData) {
    await Product.create({ ...p, status: "ACTIVE", imageUrls: [] })
    console.log(`[Seed]   Product: ${p.name}`)
  }

  // 5. Coupons
  console.log("[Seed] Seeding coupons...")
  for (const c of coupons) {
    await Coupon.create(c)
    console.log(`[Seed]   Coupon: ${c.code} — ${c.description}`)
  }

  // Summary
  const userCount     = await User.countDocuments()
  const catCount      = await Category.countDocuments()
  const productCount  = await Product.countDocuments()
  const couponCount   = await Coupon.countDocuments()

  console.log("")
  console.log("[Seed] ============================================")
  console.log("[Seed] Seed complete.")
  console.log(`[Seed]   Users:      ${userCount} (1 admin + ${userCount - 1} customers)`)
  console.log(`[Seed]   Categories: ${catCount}`)
  console.log(`[Seed]   Products:   ${productCount}`)
  console.log(`[Seed]   Coupons:    ${couponCount}`)
  console.log("[Seed] ============================================")
  console.log("")
  console.log("[Seed] Admin credentials:")
  console.log(`[Seed]   Email:    ${ADMIN_EMAIL}`)
  console.log(`[Seed]   Password: ${ADMIN_PASSWORD}`)
  console.log("")
  console.log("[Seed] Customer credentials (all same password):")
  console.log("[Seed]   Password: Customer@123")
  console.log("")
  console.log("[Seed] Coupons:")
  console.log("[Seed]   WELCOME10 — 10% off, no minimum, 1 use per user")
  console.log("[Seed]   BIGORDER  — ₱50 off orders ₱500+, 3 uses per user")
}

seed()
  .then(() => {
    console.log("[Seed] Disconnected.")
    process.exit(0)
  })
  .catch((err) => {
    console.error("[Seed] Error:", err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(() => {
    mongoose.disconnect()
  })