import { z } from "zod"

export const RegisterSchema = z.object({
  email:     z.string().email("Must be a valid email"),
  password:  z
    .string()
    .min(8, "Must be at least 8 characters")
    .refine((v) => /[A-Z]/.test(v), "Must contain at least one uppercase letter")
    .refine((v) => /\d/.test(v), "Must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName:  z.string().min(1, "Last name is required").max(50),
})

export const LoginSchema = z.object({
  email:    z.string().email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     z
      .string()
      .min(8, "Must be at least 8 characters")
      .refine((v) => /[A-Z]/.test(v), "Must contain at least one uppercase letter")
      .refine((v) => /\d/.test(v), "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
})

export type RegisterInput       = z.infer<typeof RegisterSchema>
export type LoginInput          = z.infer<typeof LoginSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type UpdateProfileInput  = z.infer<typeof UpdateProfileSchema>