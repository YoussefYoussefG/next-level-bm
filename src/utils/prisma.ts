import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// -----------------------------------------------------------------------------
// Prisma Client Singleton
// Prevents connection pool exhaustion in development (hot-reload) and testing.
// Logs queries in development mode via the custom logger.
// -----------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDevOrTest = process.env.NODE_ENV !== 'production';

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDevOrTest
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
  });

// Log queries in development for debugging
if (isDevOrTest && process.env.NODE_ENV !== 'test') {
  (prisma as any).$on('query', (e: any) => {
    logger.debug(`Prisma Query`, {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

(prisma as any).$on('error', (e: any) => {
  logger.error('Prisma Error', { message: e.message, target: e.target });
});

if (isDevOrTest) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
