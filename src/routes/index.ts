import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import analyticsRoutes from './analytics.routes';

// -----------------------------------------------------------------------------
// Central Router
// Mounts all route groups under /api/v1/
// -----------------------------------------------------------------------------

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
