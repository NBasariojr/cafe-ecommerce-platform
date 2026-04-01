// Single source of truth for every backend endpoint path.
// Always use these constants in Axios calls — never hardcode strings.
// Paths with :param use the replace helper below.

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN:    "/api/auth/login",
    REFRESH:  "/api/auth/refresh",
    LOGOUT:   "/api/auth/logout",
    ME:       "/api/auth/me",
  },

  USERS: {
    PROFILE:        "/api/users/profile",
    ADDRESSES:      "/api/users/addresses",
    ADDRESS_BY_ID:  "/api/users/addresses/:id",
    PUSH_TOKEN:     "/api/users/push-token",
  },

  PRODUCTS: {
    LIST:          "/api/products",
    DETAIL:        "/api/products/:slug",
    CREATE:        "/api/products",
    UPDATE:        "/api/products/:id",
    DELETE:        "/api/products/:id",
    TOGGLE_STATUS: "/api/products/:id/status",
  },

  CATEGORIES: {
    LIST:    "/api/categories",
    TREE:    "/api/categories/tree",
    BY_SLUG: "/api/categories/:slug",
    CREATE:  "/api/categories",
    UPDATE:  "/api/categories/:id",
    DELETE:  "/api/categories/:id",
    REORDER: "/api/categories/reorder",
  },

  CART: {
    GET:          "/api/cart",
    ADD_ITEM:     "/api/cart/items",
    UPDATE_ITEM:  "/api/cart/items/:itemId",
    REMOVE_ITEM:  "/api/cart/items/:itemId",
    CLEAR:        "/api/cart",
    APPLY_COUPON: "/api/cart/coupon",
  },

  ORDERS: {
    PLACE:         "/api/orders",
    MY_ORDERS:     "/api/orders/my-orders",
    DETAIL:        "/api/orders/:id",
    CANCEL:        "/api/orders/:id/cancel",
    EXPORT:        "/api/orders/export",
    ADMIN_LIST:    "/api/orders",
    UPDATE_STATUS: "/api/orders/:id/status",
  },

  PAYMENTS: {
    CREATE_INTENT: "/api/payments/intent",
    WEBHOOK:       "/api/payments/webhook",
  },

  COUPONS: {
    VALIDATE: "/api/coupons/validate",
    LIST:     "/api/coupons",
    CREATE:   "/api/coupons",
    UPDATE:   "/api/coupons/:id",
    DELETE:   "/api/coupons/:id",
    USAGE:    "/api/coupons/:id/usage",
  },

  REVIEWS: {
    BY_PRODUCT: "/api/reviews/product/:productId",
    CREATE:     "/api/reviews",
    MODERATE:   "/api/reviews/:id/moderate",
    ADMIN_LIST: "/api/reviews",
  },

  UPLOAD: {
    PRESIGNED_URL: "/api/upload/presigned",
  },

  ANALYTICS: {
    REVENUE:      "/api/analytics/revenue",
    TOP_PRODUCTS: "/api/analytics/top-products",
    CUSTOMERS:    "/api/analytics/customers",
    EXPORT:       "/api/analytics/export",
  },

  FLAGS: {
    GET: "/api/flags",
  },

  HEALTH: "/health",
} as const

// Helper to replace :param placeholders in route strings.
// Usage: buildUrl(API_ROUTES.ORDERS.DETAIL, { id: "abc123" })
// Returns: "/api/orders/abc123"
export function buildUrl(
  route: string,
  params: Record<string, string>
): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`:${key}`, encodeURIComponent(value)),
    route
  )
}