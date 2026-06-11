# BM — Business Management Service

A production-grade Node.js backend API built with **Clean Architecture**, strict TypeScript, and enterprise-level patterns. Designed as a fully functional business operations platform — not a demo.

[![CI](https://github.com/your-username/next-level-bm/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/next-level-bm/actions)

---

## 💼 What It Does

This API powers the backend of an e-commerce or B2B business operations system. It provides:

1. **Staff Administration** — ADMIN role can onboard employees, controlling feature access via JWT + RBAC.
2. **Product Catalog** — Full CRUD with search, sort, pagination, price range filtering, and soft-delete.
3. **Order Processing** — Transactional checkout that atomically validates stock, decrements inventory, and creates orders.
4. **Business Analytics** — Dashboard endpoint with revenue metrics, top-selling products, low-stock alerts, and time-series data.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20+ |
| **Framework** | Express.js |
| **Language** | TypeScript (Strict Mode) |
| **Database** | PostgreSQL 16+ |
| **ORM** | Prisma 5 |
| **Validation** | Zod |
| **Authentication** | JWT + bcryptjs (RBAC) |
| **Security** | Helmet, CORS, Rate Limiting |
| **Testing** | Jest + Supertest |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 📂 Architecture

```
src/
├── controllers/     # HTTP request handlers (thin layer)
├── services/        # Core business logic & Prisma queries
├── routes/          # Express route definitions
├── schemas/         # Zod validation schemas
├── middlewares/     # Auth, validation, error handling, rate limiting
├── utils/           # Helpers, logger, errors, Prisma client
├── __tests__/       # Jest integration tests
└── index.ts         # App entry point
```

**Design Principles:**
- **Controller → Service → Prisma** — each layer has a single responsibility
- **No try/catch boilerplate** — `asyncHandler` wrapper propagates errors to the global handler
- **Consistent JSON envelope** — every response follows `{ status, data, meta? }` or `{ status, message, errors? }`
- **Type-safe end-to-end** — Zod schemas validate input, Prisma types validate DB queries

---

## 🎯 API Reference

Base URL: `http://localhost:3000/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Create a new account |
| `POST` | `/auth/login` | ❌ | Authenticate & receive tokens |
| `GET` | `/auth/me` | ✅ | Get current user profile |
| `POST` | `/auth/refresh` | ❌ | Refresh access token |

<details>
<summary><strong>Register Example</strong></summary>

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass1",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "name": "Admin User",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```
</details>

---

### Products

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/products` | ✅ | ADMIN | Create a product |
| `GET` | `/products` | ✅ | Any | List products (paginated) |
| `GET` | `/products/:id` | ✅ | Any | Get single product |
| `PATCH` | `/products/:id` | ✅ | ADMIN | Update a product |
| `DELETE` | `/products/:id` | ✅ | ADMIN | Soft-delete a product |

**Query Parameters for `GET /products`:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `search` | string | — | Search by name/description |
| `sortBy` | enum | `createdAt` | `name`, `price`, `stock`, `createdAt` |
| `sortDir` | enum | `desc` | `asc`, `desc` |
| `minPrice` | number | — | Minimum price filter |
| `maxPrice` | number | — | Maximum price filter |

---

### Orders

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/orders` | ✅ | Any | Create order (validates stock) |
| `GET` | `/orders` | ✅ | Scoped | List orders |
| `GET` | `/orders/:id` | ✅ | Scoped | Get single order |
| `PATCH` | `/orders/:id/status` | ✅ | ADMIN | Update order status |
| `POST` | `/orders/:id/cancel` | ✅ | Owner/ADMIN | Cancel & restore stock |

**Order Status FSM:**
```
PENDING ──→ PROCESSING ──→ COMPLETED
   │              │
   └──→ CANCELLED ←──┘
```

<details>
<summary><strong>Create Order Example</strong></summary>

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": "uuid-1", "quantity": 2 },
      { "productId": "uuid-2", "quantity": 1 }
    ]
  }'
```
</details>

---

### Analytics

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/analytics/dashboard` | ✅ | ADMIN | Full business dashboard |

**Dashboard Response includes:**
- Revenue breakdown (total, completed, pending)
- Orders by status
- Top 5 selling products
- Low stock alerts (stock < 10)
- Revenue over time (last 30 days)
- User counts by role
- Last 10 orders

---

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | ❌ | App + database connectivity check |

---

## 🛠 Getting Started

### Prerequisites
- **Node.js** v20+
- **PostgreSQL** (local, Docker, or cloud)
- **Git**

### Quick Start (with Docker)

```bash
# Clone & enter
git clone https://github.com/your-username/next-level-bm.git
cd next-level-bm

# Start PostgreSQL + API
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy
```

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and a strong JWT_SECRET

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Start development server
npm run dev
```

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `PORT` | ❌ | `3000` | Server port |
| `NODE_ENV` | ❌ | `development` | `development`, `production`, `test` |
| `JWT_SECRET` | ✅ | — | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | `1h` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | `7d` | Refresh token expiry |
| `BCRYPT_ROUNDS` | ❌ | `12` | bcrypt hash rounds (10-14) |
| `RATE_LIMIT_WINDOW_MS` | ❌ | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | ❌ | `100` | Max requests per window (global) |
| `AUTH_RATE_LIMIT_MAX` | ❌ | `10` | Max auth attempts per window |
| `CORS_ORIGIN` | ❌ | `*` | Allowed CORS origins |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

Tests use **Jest** + **Supertest** with a real PostgreSQL database (configure `DATABASE_URL` for test env). Tests run in band (`--runInBand`) to avoid concurrency issues.

**Test coverage includes:**
- ✅ Auth: register, login, profile, token refresh, validation, edge cases
- ✅ Products: CRUD, role guards, pagination, search, price filtering, soft-delete
- ✅ Orders: transactional creation, stock validation, FSM status transitions, cancellation with stock restore, role scoping
- ✅ Analytics: admin access control, response shape validation
- ✅ Health: enhanced DB connectivity check

---

## 🔒 Security Features

- **Helmet** — sets security-related HTTP headers
- **CORS** — configurable origin restriction
- **Rate Limiting** — global + stricter auth-specific limits
- **JWT + Refresh Tokens** — short-lived access tokens + long-lived refresh tokens
- **bcrypt** — constant-time password comparison, configurable salt rounds
- **Input Validation** — Zod schemas on all endpoints (body, query, params)
- **Error Sanitization** — raw DB errors are wrapped; stack traces hidden in production
- **Soft Delete** — products are soft-deleted to preserve order history integrity

---

## 📦 Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (DB GUI) |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |

---

## 🏗 Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Soft-delete for products** | Preserves order history — hard delete would break FK references |
| **Order status FSM** | Prevents invalid state transitions (e.g., COMPLETED → PENDING) |
| **Transactional orders** | Stock decrement + order creation are atomic — no partial failures |
| **String-based price validation** | Avoids floating-point rounding issues in monetary values |
| **In-memory rate limiter** | Simple for single-instance; documented path to Redis for scaling |
| **Test-quiet logger** | Logger suppresses output during tests to keep test output clean |

---

## 📄 License

ISC
