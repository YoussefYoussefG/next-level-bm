import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// JWT Authentication & Role Authorization Middleware
// -----------------------------------------------------------------------------

/** Shape of the decoded JWT payload attached to req.user */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/** Extend Express Request to carry authenticated user data */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies JWT from the `Authorization: Bearer <token>` header.
 * Attaches decoded payload to `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed authorization header');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    const secret = process.env.JWT_SECRET || '';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired', { error: 'TokenExpiredError' });
      throw new UnauthorizedError('Token has expired — please log in again');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Authentication failed');
  }
}

/**
 * Role-based authorization gate.
 * Must be used AFTER `authenticate`.
 * Returns 403 if the user's role is not in the allowed list.
 *
 * @example
 * router.post('/', authenticate, authorize('ADMIN'), controller.create);
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required before authorization');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization denied', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
      });
      throw new ForbiddenError(
        `Role '${req.user.role}' is not authorized. Required: ${roles.join(' or ')}`
      );
    }

    next();
  };
}
