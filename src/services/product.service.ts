import prisma from '../utils/prisma';
import { CreateProductInput, UpdateProductInput, ProductQuery } from '../schemas/product.schema';
import { NotFoundError, DatabaseError } from '../utils/errors';
import { buildPaginationMeta, PaginationMeta } from '../utils/helpers';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// Product Service
// Full CRUD with soft-delete, paginated listing, search, sorting, and filtering.
// -----------------------------------------------------------------------------

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createProduct(data: CreateProductInput) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        stock: data.stock,
      },
    });

    logger.info('Product created', { productId: product.id, name: product.name });
    return product;
  } catch (error) {
    throw new DatabaseError('Failed to create product', error as Error);
  }
}

// ─── List (Paginated, Searchable, Sortable) ──────────────────────────────────

export async function getAllProducts(query: ProductQuery) {
  const { page, limit, search, sortBy, sortDir, minPrice, maxPrice } = query;
  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const where: any = {
    deletedAt: null, // Exclude soft-deleted products
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const meta = buildPaginationMeta(totalItems, page, limit);
  return { products, meta };
}

// ─── Get By ID ───────────────────────────────────────────────────────────────

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      _count: {
        select: { orderItems: true },
      },
    },
  });

  if (!product) {
    throw new NotFoundError('Product');
  }

  return product;
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, data: UpdateProductInput) {
  // Verify product exists and is not deleted
  await getProductById(id);

  try {
    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    logger.info('Product updated', { productId: id, fields: Object.keys(data) });
    return updated;
  } catch (error) {
    throw new DatabaseError('Failed to update product', error as Error);
  }
}

// ─── Soft Delete ─────────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  // Verify product exists and is not already deleted
  await getProductById(id);

  try {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Product soft-deleted', { productId: id });
  } catch (error) {
    throw new DatabaseError('Failed to delete product', error as Error);
  }
}
