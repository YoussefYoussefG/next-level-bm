import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// Request Logger Middleware
// Logs method, URL, status code, and response time for every request.
// -----------------------------------------------------------------------------

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Log after the response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.originalUrl, res.statusCode, duration);
  });

  next();
}
