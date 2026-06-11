// -----------------------------------------------------------------------------
// Structured Logger
// Provides colored, timestamped log output with configurable levels.
// Used throughout the application instead of raw console.log.
// -----------------------------------------------------------------------------

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
} as const;

const LEVEL_CONFIG: Record<LogLevel, { label: string; color: string }> = {
  [LogLevel.DEBUG]: { label: 'DEBUG', color: COLORS.dim },
  [LogLevel.INFO]: { label: ' INFO', color: COLORS.green },
  [LogLevel.WARN]: { label: ' WARN', color: COLORS.yellow },
  [LogLevel.ERROR]: { label: 'ERROR', color: COLORS.red },
};

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const { label, color } = LEVEL_CONFIG[level];
  const timestamp = `${COLORS.dim}${getTimestamp()}${COLORS.reset}`;
  const levelTag = `${color}${COLORS.bold}[${label}]${COLORS.reset}`;
  const metaStr = meta ? ` ${COLORS.dim}${JSON.stringify(meta)}${COLORS.reset}` : '';

  return `${timestamp} ${levelTag} ${message}${metaStr}`;
}

function getCurrentLevel(): LogLevel {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'test') return LogLevel.ERROR; // Quiet during tests
  if (env === 'production') return LogLevel.INFO;
  return LogLevel.DEBUG;
}

function shouldLog(level: LogLevel): boolean {
  return level >= getCurrentLevel();
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.debug(formatMessage(LogLevel.DEBUG, message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog(LogLevel.INFO)) {
      console.info(formatMessage(LogLevel.INFO, message, meta));
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage(LogLevel.WARN, message, meta));
    }
  },

  error(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatMessage(LogLevel.ERROR, message, meta));
    }
  },

  /** Logs HTTP request details — used by the request logger middleware */
  http(method: string, url: string, statusCode: number, durationMs: number): void {
    const statusColor =
      statusCode >= 500 ? COLORS.red :
      statusCode >= 400 ? COLORS.yellow :
      statusCode >= 300 ? COLORS.cyan :
      COLORS.green;

    const msg =
      `${COLORS.bold}${method}${COLORS.reset} ${url} ` +
      `${statusColor}${statusCode}${COLORS.reset} ` +
      `${COLORS.dim}${durationMs}ms${COLORS.reset}`;

    if (shouldLog(LogLevel.INFO)) {
      console.info(`${COLORS.dim}${getTimestamp()}${COLORS.reset} ${COLORS.magenta}${COLORS.bold}[  HTTP]${COLORS.reset} ${msg}`);
    }
  },
};
