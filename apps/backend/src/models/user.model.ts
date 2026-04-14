import mongoose, { Document, Model, Schema } from "mongoose"
import bcrypt from "bcryptjs"
import { UserRole } from "@cafe/shared"

// Address sub-document interface
export interface IAddress {
  _id?: mongoose.Types.ObjectId
  label?: string
  street: string
  city: string
  province: string
  zipCode: string
  isDefault: boolean
}

// Full user document interface including Mongoose Document fields.
// IUser must structurally match the User interface in @cafe/shared/types/user.ts.
// password and refreshToken are select: false - never returned by default.
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  addresses: IAddress[]
  refreshToken?: string
  loyaltyPoints: number
  pushTokens: string[]
  createdAt: Date
  updatedAt: Date

  // Instance methods
  comparePassword(candidate: string): Promise<boolean>
  toSafeObject(): SafeUserObject
}

// Shape returned by toSafeObject() - no password, no refreshToken.
export interface SafeUserObject {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  addresses: IAddress[]
  loyaltyPoints: number
  pushTokens: string[]
  createdAt: Date
  updatedAt: Date
}

// Static methods on the User model.
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>
}

// Address sub-document schema.
// Embedded in User - no separate collection, no separate indexes needed.
const AddressSchema = new Schema<IAddress>(
  {
    label:     { type: String, trim: true },
    street:    { type: String, required: true, trim: true },
    city:      { type: String, required: true, trim: true },
    province:  { type: String, required: true, trim: true },
    zipCode:   { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
)

// Main User schema.
const UserSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      index:     true,
    },
    password: {
      type:     String,
      required: [true, "Password is required"],
      select:   false, // Never returned in queries unless explicitly selected
      minlength: 8,
    },
    firstName: {
      type:     String,
      required: [true, "First name is required"],
      trim:     true,
      maxlength: 50,
    },
    lastName: {
      type:     String,
      required: [true, "Last name is required"],
      trim:     true,
      maxlength: 50,
    },
    role: {
      type:    String,
      enum:    Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    addresses: {
      type:    [AddressSchema],
      default: [],
    },
    refreshToken: {
      type:   String,
      select: false, // Never returned in queries unless explicitly selected
    },
    loyaltyPoints: {
      type:    Number,
      default: 0,
      min:     [0, "Loyalty points cannot be negative"],
    },
    pushTokens: {
      type:    [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
)

// Pre-save hook: hash password with bcryptjs (10 rounds) only when modified.
// Skipping this check would re-hash an already-hashed password on every save.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err as Error)
  }
})

// Instance method: compares a plain-text candidate against the stored bcrypt hash.
// Returns true for a match, false otherwise. Never throws on mismatch.
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

// Instance method: returns a plain object with sensitive fields removed.
// Use this in every API response - never send the raw Mongoose document.
UserSchema.methods.toSafeObject = function (): SafeUserObject {
  return {
    id:            this._id.toString(),
    email:         this.email,
    firstName:     this.firstName,
    lastName:      this.lastName,
    role:          this.role,
    isActive:      this.isActive,
    addresses:     this.addresses,
    loyaltyPoints: this.loyaltyPoints,
    pushTokens:    this.pushTokens,
    createdAt:     this.createdAt,
    updatedAt:     this.updatedAt,
  }
}

// Static method: finds a user by email with password field included.
// Used in login and password-change flows where the hash is needed for comparison.
// All other queries should omit .select("+password") so the hash stays hidden.
UserSchema.statics.findByEmail = function (
  email: string
): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase().trim() })
    .select("+password +refreshToken")
    .exec()
}

// Prevent model re-registration error in hot-reload environments (ts-node-dev).
export const User = (mongoose.models.User ??
  mongoose.model<IUser, IUserModel>("User", UserSchema)) as IUserModel