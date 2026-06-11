// -----------------------------------------------------------------------------
// Custom Error Classes
// Each carries an HTTP status code used by the global error handler.
// -----------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 - Bad Request */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/** 401 - Unauthorized (authentication required or failed) */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/** 403 - Forbidden (insufficient permissions) */
export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

/** 404 - Resource Not Found */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/** 409 - Conflict (e.g. duplicate email) */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/** 422 - Validation Error with field-level details */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation failed', 422);
    this.errors = errors;
  }
}

/** 429 - Too Many Requests */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

/** 500 - Wraps unknown database/internal failures without leaking raw errors */
export class DatabaseError extends AppError {
  public readonly originalError?: Error;

  constructor(message = 'A database error occurred', originalError?: Error) {
    super(message, 500, false);
    this.originalError = originalError;
  }
}
