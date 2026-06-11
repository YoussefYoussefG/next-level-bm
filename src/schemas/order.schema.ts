import { z } from 'zod';
import { paginationSchema, sortDirectionSchema } from './common.schema';

// -----------------------------------------------------------------------------
// Order Schemas
// Validates order creation (item list) and status transitions.
// -----------------------------------------------------------------------------

/** A single item in the order */
const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot contain more than 50 items'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: PENDING, PROCESSING, COMPLETED, CANCELLED' }),
  }),
});

/** Allowed sort fields for orders */
const orderSortFields = z.enum(['createdAt', 'totalAmount', 'status']).default('createdAt');

export const orderQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
  sortBy: orderSortFields,
  sortDir: sortDirectionSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
