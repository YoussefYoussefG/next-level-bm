import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// Analytics Service
// Aggregated business intelligence queries for the admin dashboard.
// All data is computed in real-time from the database.
// For high-traffic deployments, consider caching with a short TTL.
// -----------------------------------------------------------------------------

export interface DashboardStats {
  revenue: {
    total: number;
    completed: number;
    pending: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    recentOrders: any[];
  };
  products: {
    total: number;
    topSelling: any[];
    lowStock: any[];
  };
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    // Revenue aggregations
    completedRevenue,
    pendingRevenue,
    totalRevenue,

    // Order counts by status
    ordersByStatus,
    totalOrders,

    // Recent orders
    recentOrders,

    // Product stats
    totalProducts,
    lowStockProducts,

    // Top selling products (by quantity in completed orders)
    topSellingProducts,

    // User stats
    totalUsers,
    usersByRole,

    // Revenue over time (last 30 days)
    revenueOverTime,
  ] = await Promise.all([
    // Revenue for completed orders
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),

    // Revenue for pending/processing orders
    prisma.order.aggregate({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      _sum: { totalAmount: true },
    }),

    // Total revenue (all non-cancelled)
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),

    // Orders grouped by status
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),

    // Total order count
    prisma.order.count(),

    // Last 10 orders
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),

    // Total active products
    prisma.product.count({ where: { deletedAt: null } }),

    // Low stock products (stock < 10)
    prisma.product.findMany({
      where: { stock: { lt: 10 }, deletedAt: null },
      orderBy: { stock: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
      },
    }),

    // Top 5 selling products
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { status: { in: ['COMPLETED', 'PROCESSING'] } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // Total users
    prisma.user.count(),

    // Users by role
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),

    // Revenue over the last 30 days using raw SQL for date grouping
    prisma.$queryRaw<Array<{ date: string; revenue: number; order_count: number }>>`
      SELECT
        DATE("createdAt") as date,
        COALESCE(SUM("totalAmount"), 0)::float as revenue,
        COUNT(*)::int as order_count
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        AND "status" != 'CANCELLED'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `,
  ]);

  // Resolve top selling product names
  const topProductIds = topSellingProducts.map((p) => p.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true },
  });
  const productNameMap = new Map(topProductDetails.map((p) => [p.id, p]));

  // Build response
  const stats: DashboardStats = {
    revenue: {
      total: totalRevenue._sum.totalAmount || 0,
      completed: completedRevenue._sum.totalAmount || 0,
      pending: pendingRevenue._sum.totalAmount || 0,
    },
    orders: {
      total: totalOrders,
      byStatus: Object.fromEntries(
        ordersByStatus.map((g) => [g.status, g._count])
      ),
      recentOrders,
    },
    products: {
      total: totalProducts,
      topSelling: topSellingProducts.map((tp) => ({
        ...productNameMap.get(tp.productId),
        totalQuantitySold: tp._sum.quantity || 0,
      })),
      lowStock: lowStockProducts,
    },
    users: {
      total: totalUsers,
      byRole: Object.fromEntries(
        usersByRole.map((g) => [g.role, g._count])
      ),
    },
    revenueOverTime: revenueOverTime.map((row) => ({
      date: String(row.date),
      revenue: Number(row.revenue),
      orderCount: Number(row.order_count),
    })),
  };

  logger.debug('Dashboard stats computed');
  return stats;
}

// ─── Health Check with DB Connectivity ───────────────────────────────────────

export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTimeMs: number;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      responseTimeMs: Date.now() - start,
    };
  } catch {
    return {
      status: 'unhealthy',
      responseTimeMs: Date.now() - start,
    };
  }
}
