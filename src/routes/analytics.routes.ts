import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

// -----------------------------------------------------------------------------
// Analytics Routes
// GET /api/v1/analytics/dashboard — Dashboard stats (ADMIN only)
// -----------------------------------------------------------------------------

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getDashboardStats
);

export default router;
