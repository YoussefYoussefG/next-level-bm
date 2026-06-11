import { z } from 'zod';

// -----------------------------------------------------------------------------
// Environment Variable Validation
// Validates all required env vars at startup using Zod.
// Fails fast with clear error messages if any are missing or invalid.
// -----------------------------------------------------------------------------

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().min(1).default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(14).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 min
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates and returns typed environment variables.
 * Caches the result after first parse.
 * @throws {Error} If validation fails — the app should not start.
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('\n╔══════════════════════════════════════════════╗');
    console.error('║  ❌  Environment Variable Validation Failed  ║');
    console.error('╚══════════════════════════════════════════════╝\n');
    console.error(formatted);
    console.error('\nPlease check your .env file and try again.\n');

    process.exit(1);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Resets the cached env — useful for testing.
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}
