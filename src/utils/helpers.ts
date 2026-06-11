import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ValidationError } from './errors';

// -----------------------------------------------------------------------------
// Async Handler Wrapper
// Eliminates try/catch boilerplate in every controller.
// -----------------------------------------------------------------------------
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// -----------------------------------------------------------------------------
// Response Formatters
// Consistent JSON envelope for all successful responses.
// -----------------------------------------------------------------------------

interface SuccessResponse<T> {
  status: 'success';
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: PaginationMeta): void {
  const response: SuccessResponse<T> = { status: 'success', data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

// -----------------------------------------------------------------------------
// Pagination Helper
// Computes pagination metadata from total count and query params.
// -----------------------------------------------------------------------------

export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// -----------------------------------------------------------------------------
// Zod Error Transformer
// Converts ZodError into our ValidationError format with user-friendly messages.
// -----------------------------------------------------------------------------

export function transformZodError(error: ZodError): ValidationError {
  const fieldErrors = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  return new ValidationError(fieldErrors);
}

// -----------------------------------------------------------------------------
// Omit Fields Helper
// Removes sensitive fields from objects (e.g., password from user records).
// -----------------------------------------------------------------------------

export function omitFields<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// -----------------------------------------------------------------------------
// Order Status FSM
// Defines allowed state transitions for orders.
// -----------------------------------------------------------------------------

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],       // Terminal state — no further transitions
  CANCELLED: [],       // Terminal state — no further transitions
};

export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions) return false;
  return allowedTransitions.includes(newStatus);
}
