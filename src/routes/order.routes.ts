import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uuidParamSchema } from '../schemas/common.schema';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../schemas/order.schema';

// -----------------------------------------------------------------------------
// Order Routes
// POST   /api/v1/orders              — Create order (authenticated)
// GET    /api/v1/orders              — List orders (scoped by role)
// GET    /api/v1/orders/:id          — Get single order (ownership/admin)
// PATCH  /api/v1/orders/:id/status   — Update order status (ADMIN only)
// POST   /api/v1/orders/:id/cancel   — Cancel order (ownership or ADMIN)
// -----------------------------------------------------------------------------

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post(
  '/',
  validate(createOrderSchema, 'body'),
  orderController.createOrder
);

router.get(
  '/',
  validate(orderQuerySchema, 'query'),
  orderController.getAllOrders
);

router.get(
  '/:id',
  validate(uuidParamSchema, 'params'),
  orderController.getOrderById
);

router.patch(
  '/:id/status',
  authorize('ADMIN'),
  validate(uuidParamSchema, 'params'),
  validate(updateOrderStatusSchema, 'body'),
  orderController.updateOrderStatus
);

router.post(
  '/:id/cancel',
  validate(uuidParamSchema, 'params'),
  orderController.cancelOrder
);

export default router;
