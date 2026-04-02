// Custom error class used throughout the backend.
// Throw this instead of plain Error to attach HTTP status codes and
// machine-readable error codes to every error response.
//
// Usage:
//   throw new AppError(404, "USER_NOT_FOUND", "No user with that ID")
//   throw new AppError(422, "VALIDATION_ERROR", "Invalid input", { field: "msg" })

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "AppError"
    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}