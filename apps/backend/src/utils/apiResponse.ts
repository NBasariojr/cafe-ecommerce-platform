// Standardized response helpers — use these in EVERY controller.
// Never call res.json() directly with a custom shape.
//
// Success shape: { success: true, data: T, message?: string }
// Error shape:   { success: false, error: { code, message, details? } }

export const apiResponse = {
  success<T>(data: T, message?: string) {
    return {
      success: true as const,
      data,
      ...(message !== undefined && { message }),
    }
  },

  error(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    return {
      success: false as const,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
    }
  },
}