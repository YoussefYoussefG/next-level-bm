import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

// -----------------------------------------------------------------------------
// Auth Routes
// POST /api/v1/auth/register — Create a new account
// POST /api/v1/auth/login    — Authenticate and receive tokens
// GET  /api/v1/auth/me       — Get current user profile (authenticated)
// POST /api/v1/auth/refresh  — Refresh access token
// -----------------------------------------------------------------------------

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema, 'body'),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema, 'body'),
  authController.login
);

router.get(
  '/me',
  authenticate,
  authController.getProfile
);

router.post(
  '/refresh',
  authController.refreshToken
);

export default router;
