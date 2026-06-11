import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import {
  AppError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  DatabaseError,
} from '../utils/errors';
import { omitFields } from '../utils/helpers';
import { logger } from '../utils/logger';

// -----------------------------------------------------------------------------
// Auth Service
// Handles registration, login, profile retrieval, and token management.
// Passwords are hashed with bcrypt using configurable salt rounds.
// JWTs include userId, email, and role in the payload.
// -----------------------------------------------------------------------------

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/** Generate an access token */
function generateAccessToken(userId: string, email: string, role: string): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign({ userId, email, role }, JWT_SECRET, options);
}

/** Generate a refresh token with longer expiry */
function generateRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, options);
}

/** Strips the password field from user objects */
function sanitizeUser(user: Record<string, unknown>) {
  return omitFields(user, ['password'] as any);
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(data: RegisterInput) {
  // Check for existing email
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    });

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    logger.info('New user registered', { userId: user.id, email: user.email, role: user.role });

    return {
      user: sanitizeUser(user as any),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new DatabaseError('Failed to create user account', error as Error);
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    // Use constant-time-like response to avoid user enumeration
    throw new UnauthorizedError('Invalid email or password');
  }

  // bcrypt.compare is constant-time
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  logger.info('User logged in', { userId: user.id, email: user.email });

  return {
    user: sanitizeUser(user as any),
    accessToken,
    refreshToken,
  };
}

// ─── Get Profile ─────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return sanitizeUser(user as any);
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

export async function refreshAccessToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired — please log in again');
    }
    if (error instanceof AppError) throw error;
    throw new UnauthorizedError('Invalid refresh token');
  }
}
