import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { asyncHandler, sendSuccess, sendCreated } from '../utils/helpers';

// -----------------------------------------------------------------------------
// Order Controller
// Handles order lifecycle with role-scoped access.
// -----------------------------------------------------------------------------

/** POST /api/v1/orders */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!.userId, req.body);
  sendCreated(res, order);
});

/** GET /api/v1/orders */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { orders, meta } = await orderService.getAllOrders(
    req.query as any,
    req.user!.userId,
    req.user!.role
  );
  sendSuccess(res, orders, 200, meta);
});

/** GET /api/v1/orders/:id */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );
  sendSuccess(res, order);
});

/** PATCH /api/v1/orders/:id/status */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  sendSuccess(res, order);
});

/** POST /api/v1/orders/:id/cancel */
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );
  sendSuccess(res, order);
});
