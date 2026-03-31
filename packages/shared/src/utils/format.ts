import type { Coupon } from "../types/coupon"
import { CouponType } from "../enums"

/**
 * Formats a centavo integer amount into a currency string.
 * All monetary values in the platform are stored as centavo integers.
 * Example: formatCurrency(15000) => "₱150.00"
 * Example: formatCurrency(15000, "USD") => "$150.00"
 */
export function formatCurrency(amountInCentavos: number, currency = "PHP"): string {
  const amount = amountInCentavos / 100

  const symbols: Record<string, string> = {
    PHP: "₱",
    USD: "$",
    EUR: "€",
  }

  const symbol = symbols[currency] ?? currency + " "

  return (
    symbol +
    amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`

  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`

  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`

  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

/**
 * Formats an ISO 8601 date string.
 * format "default" => "Jan 15, 2024"
 * format "time"    => "10:30 AM"
 * format "full"    => "January 15, 2024 10:30 AM"
 * format "short"   => "01/15/2024"
 * format "relative" => "2 hours ago" | "just now"
 */
export function formatDate(isoString: string, format: "default" | "time" | "full" | "short" | "relative" = "default"): string {
  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) {
    return "Invalid date"
  }

  switch (format) {
    case "time":
      return date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })

    case "full":
      return (
        date.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) +
        " " +
        date.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
      )

    case "short":
      return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })

    case "relative":
      return formatRelativeTime(date)

    default:
      return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
  }
}

/**
 * Calculates the discount amount for a given cart total and coupon.
 * Always returns a non-negative integer in centavos.
 * FIXED discount cannot exceed the cart total.
 */
export function calculateDiscount(cartTotalInCentavos: number, coupon: Coupon): number {
  if (!coupon.isActive) return 0
  if (cartTotalInCentavos < coupon.minOrderAmount) return 0

  if (coupon.type === CouponType.PERCENTAGE) {
    const discount = Math.floor((cartTotalInCentavos * coupon.value) / 100)
    return Math.max(0, discount)
  }

  // FIXED — cannot exceed cart total
  return Math.min(coupon.value, cartTotalInCentavos)
}

/**
 * Truncates text to a max length, appending "..." if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trimEnd() + "..."
}