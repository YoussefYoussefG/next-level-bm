import { z } from 'zod';
import { paginationSchema, sortDirectionSchema } from './common.schema';

// -----------------------------------------------------------------------------
// Product Schemas
// Uses string-based decimal validation for price to avoid floating-point issues.
// The service layer converts to Prisma's Float (or Decimal if schema is updated).
// -----------------------------------------------------------------------------

/** Regex for monetary values: positive, max 2 decimal places */
const priceSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a positive number with up to 2 decimal places')
  .transform((val) => parseFloat(val));

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
  price: priceSchema,
  stock: z.coerce.number().int('Stock must be an integer').min(0, 'Stock cannot be negative').default(0),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .trim()
    .optional()
    .nullable(),
  price: priceSchema.optional(),
  stock: z.coerce.number().int('Stock must be an integer').min(0, 'Stock cannot be negative').optional(),
});

/** Allowed sort fields — prevents sorting by arbitrary/injected columns */
const productSortFields = z.enum(['name', 'price', 'stock', 'createdAt']).default('createdAt');

export const productQuerySchema = paginationSchema.extend({
  search: z.string().max(200).trim().optional(),
  sortBy: productSortFields,
  sortDir: sortDirectionSchema,
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
