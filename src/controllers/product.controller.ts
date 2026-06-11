import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { asyncHandler, sendSuccess, sendCreated, sendNoContent } from '../utils/helpers';

// -----------------------------------------------------------------------------
// Product Controller
// CRUD operations with pagination metadata for list endpoint.
// -----------------------------------------------------------------------------

/** POST /api/v1/products */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  sendCreated(res, product);
});

/** GET /api/v1/products */
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const { products, meta } = await productService.getAllProducts(req.query as any);
  sendSuccess(res, products, 200, meta);
});

/** GET /api/v1/products/:id */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, product);
});

/** PATCH /api/v1/products/:id */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product);
});

/** DELETE /api/v1/products/:id */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  sendNoContent(res);
});
