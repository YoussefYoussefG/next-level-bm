import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';
import { asyncHandler, sendSuccess } from '../utils/helpers';

// -----------------------------------------------------------------------------
// Analytics Controller
// Admin-only dashboard data endpoint.
// -----------------------------------------------------------------------------

/** GET /api/v1/analytics/dashboard */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats();
  sendSuccess(res, stats);
});

/** GET /health — Enhanced health check with DB connectivity */
export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const dbHealth = await analyticsService.checkDatabaseHealth();

  const status = dbHealth.status === 'healthy' ? 200 : 503;

  res.status(status).json({
    status: dbHealth.status === 'healthy' ? 'success' : 'error',
    message: 'BM - Business Management Service API is running ✨',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth,
  });
});
