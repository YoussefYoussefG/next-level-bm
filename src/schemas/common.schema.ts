import { z } from 'zod';

// -----------------------------------------------------------------------------
// Common Schemas
// Reusable validation fragments used across multiple domains.
// -----------------------------------------------------------------------------

/** Validates route params that expect a UUID */
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format — expected a UUID'),
});

/** Sort direction — only allow safe values */
export const sortDirectionSchema = z.enum(['asc', 'desc']).default('desc');

/** Pagination query parameters with sensible defaults */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
