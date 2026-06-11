import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ValidationError, ConflictError, DatabaseError } from '../utils/errors';
import { transformZodError } from '../utils/helpers';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// Global Error Handler Middleware
// Must be registered LAST in the middleware chain.
// Catches all errors and returns a consistent JSON envelope.
// -----------------------------------------------------------------------------

interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  // Default error response
  let statusCode = 500;
  const response: ErrorResponse = {
    status: 'error',
    message: 'Internal server error',
  };

  // --------------------------------------------------
  // 1. Known AppError subclasses (our own errors)
  // --------------------------------------------------
  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    response.message = err.message;
    response.errors = err.errors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
  }

  // --------------------------------------------------
  // 2. Zod validation errors (if thrown directly)
  // --------------------------------------------------
  else if (err instanceof ZodError) {
    const validationErr = transformZodError(err);
    statusCode = 422;
    response.message = validationErr.message;
    response.errors = validationErr.errors;
  }

  // --------------------------------------------------
  // 3. Prisma-specific errors
  // --------------------------------------------------
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        statusCode = 409;
        response.message = `A record with this ${target} already exists`;
        break;
      }
      case 'P2025': {
        // Record not found
        statusCode = 404;
        response.message = 'The requested record was not found';
        break;
      }
      case 'P2003': {
        // Foreign key constraint
        statusCode = 400;
        response.message = 'Referenced record does not exist';
        break;
      }
      default: {
        // Unknown Prisma error — wrap and hide
        const dbError = new DatabaseError('A database error occurred', err);
        logger.error('Unhandled Prisma error', {
          code: err.code,
          message: err.message,
          meta: err.meta as Record<string, unknown>,
        });
        statusCode = dbError.statusCode;
        response.message = dbError.message;
      }
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error', { message: err.message });
    statusCode = 400;
    response.message = 'Invalid data provided';
  }

  // --------------------------------------------------
  // 4. Unknown errors — log fully, send generic message
  // --------------------------------------------------
  else {
    logger.error('Unhandled error', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // Include stack trace in development only (never leak file paths in production)
  if (isDev && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
