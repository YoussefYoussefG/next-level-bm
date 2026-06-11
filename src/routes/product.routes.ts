import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uuidParamSchema } from '../schemas/common.schema';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/product.schema';

// -----------------------------------------------------------------------------
// Product Routes
// POST   /api/v1/products       — Create product (ADMIN only)
// GET    /api/v1/products       — List products (authenticated, paginated)
// GET    /api/v1/products/:id   — Get single product (authenticated)
// PATCH  /api/v1/products/:id   — Update product (ADMIN only)
// DELETE /api/v1/products/:id   — Soft-delete product (ADMIN only)
// -----------------------------------------------------------------------------

const router = Router();

// All product routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN'),
  validate(createProductSchema, 'body'),
  productController.createProduct
);

router.get(
  '/',
  validate(productQuerySchema, 'query'),
  productController.getAllProducts
);

router.get(
  '/:id',
  validate(uuidParamSchema, 'params'),
  productController.getProductById
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(uuidParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(uuidParamSchema, 'params'),
  productController.deleteProduct
);

export default router;
