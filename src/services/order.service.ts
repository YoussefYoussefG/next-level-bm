import prisma from '../utils/prisma';
import { CreateOrderInput, OrderQuery } from '../schemas/order.schema';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  DatabaseError,
} from '../utils/errors';
import {
  buildPaginationMeta,
  isValidStatusTransition,
  ORDER_STATUS_TRANSITIONS,
} from '../utils/helpers';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// Order Service
// Transactional order creation with atomic stock management.
// Implements a finite state machine for order status transitions.
// Role-scoped queries: ADMIN sees all, EMPLOYEE sees only their own.
// -----------------------------------------------------------------------------

// ─── Create Order (Transactional) ────────────────────────────────────────────

export async function createOrder(
  userId: string,
  data: CreateOrderInput
) {
  const { items } = data;

  // Use an interactive transaction for atomicity
  return prisma.$transaction(async (tx) => {
    // 1. Fetch all referenced products and validate
    const productIds = items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
      },
    });

    // Check all products exist
    if (products.length !== new Set(productIds).size) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundError(`Products not found: ${missing.join(', ')}`);
    }

    // 2. Validate stock availability
    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock}`
        );
      }
      totalAmount += product.price * item.quantity;
    }

    // Round to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 3. Decrement stock atomically
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 4. Create order with items
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });

    logger.info('Order created', {
      orderId: order.id,
      userId,
      totalAmount,
      itemCount: items.length,
    });

    return order;
  });
}

// ─── List Orders (Role-Scoped, Paginated) ────────────────────────────────────

export async function getAllOrders(
  query: OrderQuery,
  userId?: string,
  role?: string
) {
  const { page, limit, status, sortBy, sortDir, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: any = {};

  // EMPLOYEE can only see their own orders
  if (role !== 'ADMIN' && userId) {
    where.userId = userId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [orders, totalItems] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const meta = buildPaginationMeta(totalItems, page, limit);
  return { orders, meta };
}

// ─── Get Order By ID (Ownership Check) ───────────────────────────────────────

export async function getOrderById(
  id: string,
  userId?: string,
  role?: string
) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, price: true } },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order');
  }

  // EMPLOYEE can only view their own orders
  if (role !== 'ADMIN' && order.userId !== userId) {
    throw new ForbiddenError('You can only view your own orders');
  }

  return order;
}

// ─── Update Order Status (FSM) ───────────────────────────────────────────────

export async function updateOrderStatus(id: string, newStatus: string) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    throw new NotFoundError('Order');
  }

  // Validate status transition using FSM
  if (!isValidStatusTransition(order.status, newStatus)) {
    const allowed = ORDER_STATUS_TRANSITIONS[order.status];
    throw new BadRequestError(
      `Cannot transition from '${order.status}' to '${newStatus}'. ` +
      `Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'}`
    );
  }

  // If transitioning to CANCELLED, restore stock
  if (newStatus === 'CANCELLED') {
    return cancelOrderInternal(id, order.status);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: newStatus as any },
    include: {
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  });

  logger.info('Order status updated', {
    orderId: id,
    from: order.status,
    to: newStatus,
  });

  return updated;
}

// ─── Cancel Order (Atomic Stock Restore) ─────────────────────────────────────

export async function cancelOrder(
  id: string,
  userId: string,
  role: string
) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new NotFoundError('Order');
  }

  // EMPLOYEE can only cancel their own orders
  if (role !== 'ADMIN' && order.userId !== userId) {
    throw new ForbiddenError('You can only cancel your own orders');
  }

  // Validate transition
  if (!isValidStatusTransition(order.status, 'CANCELLED')) {
    throw new BadRequestError(
      `Cannot cancel an order with status '${order.status}'`
    );
  }

  return cancelOrderInternal(id, order.status);
}

/**
 * Internal helper: cancels order and restores stock atomically.
 */
async function cancelOrderInternal(orderId: string, currentStatus: string) {
  return prisma.$transaction(async (tx) => {
    // Get order items
    const items = await tx.orderItem.findMany({
      where: { orderId },
    });

    // Restore stock for each item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Update order status
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });

    logger.info('Order cancelled with stock restored', {
      orderId,
      previousStatus: currentStatus,
      itemsRestored: items.length,
    });

    return cancelled;
  });
}
