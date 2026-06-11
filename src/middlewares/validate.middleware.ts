import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { transformZodError } from '../utils/helpers';

// -----------------------------------------------------------------------------
// Zod Validation Middleware Factory
// Validates request body, query, or params against a Zod schema.
// Returns clean 422 errors with field-level messages.
// -----------------------------------------------------------------------------

type ValidationSource = 'body' | 'query' | 'params';

/**
 * Creates an Express middleware that validates the specified request source
 * against a Zod schema.
 *
 * @param schema - The Zod schema to validate against
 * @param source - Which part of the request to validate ('body', 'query', or 'params')
 *
 * @example
 * router.post('/', validate(createProductSchema, 'body'), controller.create);
 * router.get('/', validate(productQuerySchema, 'query'), controller.list);
 * router.get('/:id', validate(uuidParamSchema, 'params'), controller.getById);
 */
export function validate(schema: ZodSchema, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      throw transformZodError(result.error);
    }

    // Replace the source with the parsed (coerced/transformed) data
    (req as any)[source] = result.data;
    next();
  };
}
