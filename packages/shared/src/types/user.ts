import type { UserRole } from "../enums"

/** A saved delivery or pickup address belonging to a user. */
export interface Address {
  id:       string
  label?:   string
  street:   string
  city:     string
  province: string
  zipCode:  string
  isDefault: boolean
}

/**
 * A registered user of the cafe platform.
 * role determines access: CUSTOMER for shoppers, ADMIN for staff.
 * passwords are never included - select: false on the Mongoose model.
 */
export interface User {
  id:            string
  email:         string
  firstName:     string
  lastName:      string
  role:          UserRole
  isActive:      boolean
  addresses:     Address[]
  loyaltyPoints: number
  pushTokens:    string[]
  createdAt:     string
  updatedAt:     string
}

/** Safe user shape returned in API responses - no password, no refreshToken. */
export type SafeUser = Omit<User, never>