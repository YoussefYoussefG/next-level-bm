import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { globalLimiter } from './middlewares/rateLimiter.middleware';
import { healthCheck } from './controllers/analytics.controller';
import { NotFoundError } from './utils/errors';
import { logger } from './utils/logger';
import prisma from './utils/prisma';

// -----------------------------------------------------------------------------
// Express Application Setup
// Security: helmet, cors, rate limiting, compression
// Logging: structured request logger
// Routes: versioned under /api/v1/
// Error Handling: 404 catch-all + global error handler (registered LAST)
// Graceful Shutdown: closes HTTP server and Prisma connection
// -----------------------------------------------------------------------------

const app: Express = express();
const port = process.env.PORT || 3000;

// ─── Security & Performance Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Health Check (Enhanced with DB connectivity) ────────────────────────────
app.get('/health', healthCheck);

// ─── API Routes (v1) ─────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── 404 Catch-All (after all routes, before error handler) ──────────────────
app.all('*', (req: Request, _res: Response) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
});

// ─── Global Error Handler (MUST be last middleware) ──────────────────────────
app.use(errorHandler);

// ─── Server Start & Graceful Shutdown ────────────────────────────────────────
if (require.main === module) {
  const server = app.listen(port, () => {
    logger.info(`🚀 BM API server running at http://localhost:${port}`);
    logger.info(`📚 API base path: http://localhost:${port}/api/v1`);
    logger.info(`💚 Health check:  http://localhost:${port}/health`);
  });

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      // Disconnect Prisma
      await prisma.$disconnect();
      logger.info('Database connection closed');

      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after 30s timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;