import type { Request, Response, NextFunction } from "express"

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

// Wraps an async Express route handler and forwards any thrown errors
// to the next() middleware (the global error handler).
// Without this wrapper, unhandled promise rejections in async routes
// crash the process instead of returning a proper error response.
//
// Usage:
//   router.get("/users/:id", asyncHandler(async (req, res) => {
//     const user = await userService.findById(req.params.id)
//     res.json(apiResponse.success(user))
//   }))
export const asyncHandler =
  (fn: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }