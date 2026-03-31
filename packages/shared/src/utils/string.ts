/**
 * Converts a string into a URL-safe slug.
 * Handles accented characters, special chars, and extra whitespace.
 * Example: slugify("Iced Caramel Macchiato") => "iced-caramel-macchiato"
 * Example: slugify("Café Latte (Hot)") => "cafe-latte-hot"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")  // strip accents
    .replaceAll(/[^a-z\d\s-]/g, "")     // keep alphanumeric, spaces, hyphens
    .trim()
    .replaceAll(/\s+/g, "-")             // spaces to hyphens
    .replaceAll(/-+/g, "-")              // collapse multiple hyphens
    .replaceAll(/^-|-$/g, "")            // trim leading/trailing hyphens
}

/**
 * Generates a unique order number.
 * Format: ORD-YYYYMMDD-XXXXX where XXXXX is 5 random uppercase alphanumeric chars.
 * Example: ORD-20240115-A3F2K
 */
export function generateOrderNumber(): string {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day   = String(now.getDate()).padStart(2, "0")
  const date  = `${year}${month}${day}`

  const chars  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const random = Array.from({ length: 5 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")

  return `ORD-${date}-${random}`
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Returns initials from a first and last name.
 * Example: initials("Juan", "Dela Cruz") => "JD"
 */
export function initials(firstName: string, lastName: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ""
  const l = lastName?.charAt(0)?.toUpperCase() ?? ""
  return `${f}${l}`
}