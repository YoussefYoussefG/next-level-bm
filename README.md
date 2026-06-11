<p align="center">
  <img src="https://img.shields.io/badge/BM-Business_Management-0D1117?style=for-the-badge&labelColor=0D1117&color=58A6FF&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM1OEE2RkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyA5bDktNyA5IDd2MTFhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ6Ij48L3BhdGg+PHBvbHlsaW5lIHBvaW50cz0iOSAyMiA5IDEyIDE1IDEyIDE1IDIyIj48L3BvbHlsaW5lPjwvc3ZnPg==" alt="BM API" />
</p>

<h1 align="center">Business Management Service</h1>

<p align="center">
  <strong>Enterprise-grade REST API for business operations — built to ship, not to demo.</strong>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-▶-2ea44f?style=for-the-badge" alt="Quick Start" /></a>
  <a href="#-api-reference"><img src="https://img.shields.io/badge/API_Docs-📚-blue?style=for-the-badge" alt="API Docs" /></a>
  <a href="#-deployment"><img src="https://img.shields.io/badge/Deploy-🚀-orange?style=for-the-badge" alt="Deploy" /></a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Jest-Testing-C21325?style=flat-square&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="CI" />
</p>

---

## 🧭 Overview

BM (Business Management) is a **production-ready backend API** that powers e-commerce and B2B business operations. It handles the full lifecycle of staff management, product catalogs, order processing, and business analytics — with enterprise security baked in from day one.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BM Service API                               │
│                                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐     │
│   │   Auth   │  │ Products │  │  Orders  │  │   Analytics   │     │
│   │  Module  │  │  Module  │  │  Module  │  │    Module     │     │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘     │
│        │              │              │               │              │
│   ┌────┴──────────────┴──────────────┴───────────────┴────────┐    │
│   │                  Service Layer (Business Logic)            │    │
│   └────┬──────────────┬──────────────┬───────────────┬────────┘    │
│        │              │              │               │              │
│   ┌────┴──────────────┴──────────────┴───────────────┴────────┐    │
│   │                   Prisma ORM + PostgreSQL                  │    │
│   └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Capabilities

<table>
<tr>
<td width="50%">

### 🔐 Authentication & RBAC
- JWT access + refresh tokens
- Role-based gates (ADMIN / EMPLOYEE)
- bcrypt with constant-time comparison
- Configurable token expiry & salt rounds

</td>
<td width="50%">

### 📦 Product Catalog
- Full CRUD with Zod validation
- Paginated search & sort
- Price range filtering
- Soft-delete preserving order history

</td>
</tr>
<tr>
<td width="50%">

### 🛒 Order Processing
- **Transactional** checkout (atomic stock mgmt)
- Finite State Machine for status transitions
- Automatic stock restore on cancellation
- Role-scoped views (ADMIN sees all)

</td>
<td width="50%">

### 📊 Business Analytics
- Revenue breakdown (total / completed / pending)
- Top 5 selling products
- Low stock alerts
- 30-day revenue time series
- User distribution by role

</td>
</tr>
</table>

---

## 🏗 Architecture

```
src/
│
├── controllers/          ← HTTP handlers (thin layer)
│   ├── auth.controller.ts
│   ├── product.controller.ts
│   ├── order.controller.ts
│   └── analytics.controller.ts
│
├── services/             ← Core business logic + Prisma queries
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── order.service.ts
│   └── analytics.service.ts
│
├── routes/               ← Express route definitions
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── order.routes.ts
│   ├── analytics.routes.ts
│   └── index.ts          ← Central router (/api/v1)
│
├── schemas/              ← Zod validation schemas
│   ├── auth.schema.ts
│   ├── product.schema.ts
│   ├── order.schema.ts
│   └── common.schema.ts
│
├── middlewares/           ← Express middleware chain
│   ├── auth.middleware.ts
│   ├── validate.middleware.ts
│   ├── errorHandler.middleware.ts
│   ├── requestLogger.middleware.ts
│   └── rateLimiter.middleware.ts
│
├── utils/                ← Shared utilities
│   ├── prisma.ts         ← Singleton client + dev logging
│   ├── logger.ts         ← Structured colored output
│   ├── errors.ts         ← Custom error hierarchy
│   ├── helpers.ts        ← Response formatters, FSM, pagination
│   └── env.ts            ← Zod-validated env vars
│
├── __tests__/            ← Integration tests (Jest + Supertest)
│
└── index.ts              ← App entry point
```

### Design Principles

| Principle | How It's Applied |
|-----------|-----------------|
| **Clean Architecture** | Controller → Service → Prisma — each layer has one job |
| **Zero Boilerplate** | `asyncHandler` wrapper eliminates try/catch in controllers |
| **Consistent Envelope** | Every response uses `{ status, data, meta? }` or `{ status, message, errors? }` |
| **Type-Safe E2E** | Zod validates input, Prisma validates DB, TypeScript glues it |
| **Fail Fast** | Environment validated at startup — no mystery crashes in production |

---

## ⚡ Quick Start

### Option A — Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/your-username/next-level-bm.git
cd next-level-bm

# Spin up PostgreSQL + API in one command
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy

# ✅ API is live at http://localhost:3000
```

### Option B — Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → Edit DATABASE_URL and JWT_SECRET (min 32 chars)

# 3. Generate Prisma client
npx prisma generate

# 4. Create database tables
npx prisma migrate dev

# 5. Launch dev server
npm run dev

# ✅ API is live at http://localhost:3000
```

### Verify It Works

```bash
curl http://localhost:3000/health
```
```json
{
  "status": "success",
  "message": "BM - Business Management Service API is running ✨",
  "database": { "status": "healthy", "responseTimeMs": 3 }
}
```

---

## 📚 API Reference

> **Base URL:** `http://localhost:3000/api/v1`

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|:------:|----------|:----:|-------------|
| `POST` | `/auth/register` | ❌ | Create a new account |
| `POST` | `/auth/login` | ❌ | Authenticate & receive tokens |
| `GET`  | `/auth/me` | 🔒 | Get current user profile |
| `POST` | `/auth/refresh` | ❌ | Refresh access token |

<details>
<summary><b>📋 Register — Request & Response</b></summary>

**Request:**
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

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "c1a2b3d4-e5f6-7890-abcd-ef1234567890",
      "email": "admin@company.com",
      "name": "Admin User",
      "role": "ADMIN",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `email` | Valid format, unique, auto-lowercased |
| `password` | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| `name` | 2–100 characters |
| `role` | `ADMIN` or `EMPLOYEE` (default: `EMPLOYEE`) |

</details>

<details>
<summary><b>📋 Login — Request & Response</b></summary>

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass1"
  }'
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "user": { "id": "...", "email": "admin@company.com", "role": "ADMIN" },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

</details>

---

### 📦 Products

| Method | Endpoint | Auth | Role | Description |
|:------:|----------|:----:|:----:|-------------|
| `POST` | `/products` | 🔒 | 👑 ADMIN | Create a product |
| `GET` | `/products` | 🔒 | Any | List products (paginated) |
| `GET` | `/products/:id` | 🔒 | Any | Get single product |
| `PATCH` | `/products/:id` | 🔒 | 👑 ADMIN | Update a product |
| `DELETE` | `/products/:id` | 🔒 | 👑 ADMIN | Soft-delete a product |

<details>
<summary><b>🔍 Query Parameters for Listing</b></summary>

| Param | Type | Default | Description |
|-------|:----:|:-------:|-------------|
| `page` | `int` | `1` | Page number |
| `limit` | `int` | `20` | Items per page (max 100) |
| `search` | `string` | — | Search by name or description |
| `sortBy` | `enum` | `createdAt` | `name` · `price` · `stock` · `createdAt` |
| `sortDir` | `enum` | `desc` | `asc` · `desc` |
| `minPrice` | `number` | — | Minimum price filter |
| `maxPrice` | `number` | — | Maximum price filter |

**Example:**
```bash
curl "http://localhost:3000/api/v1/products?search=widget&minPrice=10&maxPrice=50&sortBy=price&sortDir=asc&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response includes pagination metadata:**
```json
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

</details>

<details>
<summary><b>📋 Create Product — Request & Response</b></summary>

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Premium Widget",
    "description": "High-quality business widget",
    "price": "49.99",
    "stock": 200
  }'
```

> ⚠️ **Note:** `price` is sent as a **string** to avoid floating-point rounding. Validated with regex `^\d+(\.\d{1,2})?$`.

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Premium Widget",
    "description": "High-quality business widget",
    "price": 49.99,
    "stock": 200,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

</details>

---

### 🛒 Orders

| Method | Endpoint | Auth | Role | Description |
|:------:|----------|:----:|:----:|-------------|
| `POST` | `/orders` | 🔒 | Any | Create order (validates stock) |
| `GET` | `/orders` | 🔒 | Scoped | List orders |
| `GET` | `/orders/:id` | 🔒 | Scoped | Get single order |
| `PATCH` | `/orders/:id/status` | 🔒 | 👑 ADMIN | Update order status |
| `POST` | `/orders/:id/cancel` | 🔒 | Owner/👑 | Cancel & restore stock |

#### Order Status State Machine

```
                    ┌─────────────────┐
                    │                 │
                    ▼                 │
              ┌──────────┐     ┌──────────┐     ┌──────────────┐
  Create ───▶ │ PENDING  │────▶│PROCESSING│────▶│  COMPLETED   │
              └────┬─────┘     └────┬─────┘     └──────────────┘
                   │                │                 (terminal)
                   │                │
                   ▼                ▼
              ┌───────────────────────┐
              │      CANCELLED        │
              │   (stock restored)    │
              └───────────────────────┘
                      (terminal)
```

> **Rules:** Terminal states (`COMPLETED`, `CANCELLED`) allow no further transitions. Cancellation atomically restores stock via Prisma `$transaction`.

<details>
<summary><b>📋 Create Order — Request & Response</b></summary>

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": "a1b2c3d4-...", "quantity": 2 },
      { "productId": "e5f6g7h8-...", "quantity": 1 }
    ]
  }'
```

**What happens internally:**
1. ✅ Validates all products exist and are not deleted
2. ✅ Checks stock availability for each item
3. ✅ Decrements stock atomically (Prisma transaction)
4. ✅ Calculates total amount at checkout-time prices
5. ✅ Creates order + order items in a single commit

**Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": "order-uuid",
    "totalAmount": 149.97,
    "status": "PENDING",
    "items": [
      {
        "quantity": 2,
        "price": 49.99,
        "product": { "id": "...", "name": "Premium Widget" }
      }
    ],
    "createdAt": "2024-01-15T10:45:00.000Z"
  }
}
```

</details>

---

### 📊 Analytics

| Method | Endpoint | Auth | Role | Description |
|:------:|----------|:----:|:----:|-------------|
| `GET` | `/analytics/dashboard` | 🔒 | 👑 ADMIN | Full business dashboard |

<details>
<summary><b>📋 Dashboard Response Shape</b></summary>

```json
{
  "status": "success",
  "data": {
    "revenue": {
      "total": 125430.50,
      "completed": 98200.00,
      "pending": 27230.50
    },
    "orders": {
      "total": 1547,
      "byStatus": {
        "PENDING": 89,
        "PROCESSING": 34,
        "COMPLETED": 1380,
        "CANCELLED": 44
      },
      "recentOrders": [ "..." ]
    },
    "products": {
      "total": 156,
      "topSelling": [
        { "name": "Premium Widget", "price": 49.99, "totalQuantitySold": 892 },
        { "name": "Basic Gadget", "price": 19.99, "totalQuantitySold": 654 }
      ],
      "lowStock": [
        { "name": "Rare Component", "stock": 3, "price": 299.99 }
      ]
    },
    "users": {
      "total": 45,
      "byRole": { "ADMIN": 3, "EMPLOYEE": 42 }
    },
    "revenueOverTime": [
      { "date": "2024-01-15", "revenue": 4520.00, "orderCount": 28 },
      { "date": "2024-01-14", "revenue": 3890.50, "orderCount": 24 }
    ]
  }
}
```

</details>

---

### 💚 Health Check

```
GET /health
```

Returns app status + **database connectivity verification**:

```json
{
  "status": "success",
  "message": "BM - Business Management Service API is running ✨",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "database": {
    "status": "healthy",
    "responseTimeMs": 2
  }
}
```

---

## 🔒 Security

<table>
<tr>
<td width="50%">

### Request Security
- 🛡 **Helmet** — hardened HTTP headers
- 🌐 **CORS** — configurable origin restriction
- 🚦 **Rate Limiting** — global + auth-specific tiers
- 📏 **Body Limit** — 10MB max payload
- ✅ **Zod Validation** — every input validated

</td>
<td width="50%">

### Data Security
- 🔑 **JWT** — short-lived access + refresh tokens
- 🔐 **bcrypt** — constant-time password hashing
- 🚫 **Error Sanitization** — no stack traces in prod
- 🗑 **Soft Delete** — data integrity preserved
- 📝 **Structured Logging** — full audit trail

</td>
</tr>
</table>

### Rate Limiting Tiers

| Tier | Scope | Window | Max Requests |
|------|-------|:------:|:------------:|
| **Global** | All endpoints | 15 min | 100 |
| **Auth** | Login & Register | 15 min | 10 |

> 💡 The default in-memory store works for single instances. For multi-instance deployments, swap to [Redis store](https://www.npmjs.com/package/rate-limit-redis).

---

## 🧪 Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Test Coverage Map

| Module | Tests |
|--------|-------|
| **Auth** | Register (success, duplicate, weak password, bad email), Login (success, wrong password, non-existent), Profile (auth, unauth, invalid token) |
| **Products** | CRUD, role guards, pagination, search, price filtering, decimal validation, soft-delete, UUID validation |
| **Orders** | Transactional creation, stock validation, empty items, FSM transitions (valid + invalid), cancellation with stock restore, role scoping |
| **Analytics** | Admin access, employee rejection, response shape, health check with DB |

---

## ⚙️ Configuration

All environment variables are **validated at startup** using Zod. Missing or invalid values cause an immediate, descriptive failure.

| Variable | Required | Default | Description |
|----------|:--------:|:-------:|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Token signing key (min 32 chars) |
| `PORT` | | `3000` | Server port |
| `NODE_ENV` | | `development` | `development` · `production` · `test` |
| `JWT_EXPIRES_IN` | | `1h` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | | `7d` | Refresh token lifetime |
| `BCRYPT_ROUNDS` | | `12` | Password hash rounds (10–14) |
| `RATE_LIMIT_WINDOW_MS` | | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | | `100` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | | `10` | Max auth attempts per window |
| `CORS_ORIGIN` | | `*` | Allowed CORS origins |

---

## 🚀 Deployment

### Docker Compose (Local / Staging)

```bash
docker-compose up -d          # Start PostgreSQL + API
docker-compose exec api npx prisma migrate deploy
docker-compose logs -f api    # Watch logs
docker-compose down           # Tear down
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET` (32+ random chars)
- [ ] Configure `CORS_ORIGIN` to your domain
- [ ] Use managed PostgreSQL (e.g., AWS RDS, Supabase)
- [ ] Set `BCRYPT_ROUNDS=12` (or higher)
- [ ] Add Redis for rate limiting if running multiple instances
- [ ] Enable HTTPS via reverse proxy (nginx / Caddy)
- [ ] Monitor `/health` endpoint for uptime

---

## 📦 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload (nodemon) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run production build |
| `npm test` | Run full test suite |
| `npm run test:coverage` | Tests + coverage report |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Create & apply migrations |
| `npm run prisma:studio` | Open Prisma Studio (DB GUI) |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |

---

## 🧠 Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Soft-delete products** | Hard delete would break foreign key references in existing orders |
| **Order status FSM** | Prevents invalid transitions (e.g., `COMPLETED → PENDING`) |
| **Transactional stock** | Stock decrement + order creation are atomic — no partial failures |
| **String-based price input** | Avoids IEEE 754 floating-point rounding in monetary values |
| **In-memory rate limiter** | Simple for single instances; documented upgrade path to Redis |
| **Test-quiet logger** | Suppresses log output during tests for clean test runner output |
| **Zod env validation** | App fails fast at boot with descriptive errors, not mid-request |
| **`asyncHandler` wrapper** | Eliminates try/catch boilerplate in every controller method |

---

## 🗺 Roadmap

- [ ] Email verification on registration
- [ ] Product image uploads (multer + S3)
- [ ] Swagger / OpenAPI documentation endpoint
- [ ] Audit logging for all mutations
- [ ] Webhook notifications for order status changes
- [ ] Multi-tenant support
- [ ] Redis caching for analytics dashboard

---

<p align="center">
  <sub>Built with ❤️ using Node.js, TypeScript, Prisma & PostgreSQL</sub>
</p>
