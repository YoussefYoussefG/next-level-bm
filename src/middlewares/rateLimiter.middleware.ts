import rateLimit from 'express-rate-limit';

// -----------------------------------------------------------------------------
// Rate Limiter Middleware
// In-memory rate limiter for various endpoint tiers.
//
// ⚠️ NOTE: The default memory store is NOT suitable for multi-instance
// deployments (e.g., behind a load balancer). For production at scale,
// swap to a Redis store: https://www.npmjs.com/package/rate-limit-redis
// -----------------------------------------------------------------------------

/**
 * Global rate limiter — applied to all endpoints.
 * Prevents general DoS attacks.
 */
export const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,    // Disable `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later',
  },
});

/**
 * Strict rate limiter for auth endpoints (login, register).
 * Prevents brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later',
  },
});
