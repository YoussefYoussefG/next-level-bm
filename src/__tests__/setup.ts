import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// -----------------------------------------------------------------------------
// Test Setup & Helpers
// Provides utilities for seeding test data, generating tokens, and cleanup.
// Uses the same database — tests run in band to avoid concurrency issues.
// -----------------------------------------------------------------------------

const prisma = new PrismaClient();

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-that-is-at-least-32-chars';

/** Generate a JWT token for test users */
export function generateTestToken(
  userId: string,
  email: string,
  role: string = 'EMPLOYEE'
): string {
  return jwt.sign({ userId, email, role }, TEST_JWT_SECRET, {
    expiresIn: '1h',
  });
}

/** Create a test user and return the user object with a valid token */
export async function createTestUser(
  overrides: {
    email?: string;
    name?: string;
    role?: 'ADMIN' | 'EMPLOYEE';
    password?: string;
  } = {}
) {
  const email = overrides.email || `test-${Date.now()}@example.com`;
  const password = overrides.password || 'TestPass123';
  const hashedPassword = await bcrypt.hash(password, 4); // Low rounds for speed in tests

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: overrides.name || 'Test User',
      role: overrides.role || 'EMPLOYEE',
    },
  });

  const token = generateTestToken(user.id, user.email, user.role);

  return { user, token, rawPassword: password };
}

/** Create a test product */
export async function createTestProduct(
  overrides: {
    name?: string;
    price?: number;
    stock?: number;
    description?: string;
  } = {}
) {
  return prisma.product.create({
    data: {
      name: overrides.name || `Test Product ${Date.now()}`,
      description: overrides.description || 'A test product',
      price: overrides.price ?? 29.99,
      stock: overrides.stock ?? 100,
    },
  });
}

/** Clean up all test data — order matters due to foreign keys */
export async function cleanupDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

/** Disconnect Prisma after all tests */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export { prisma };
