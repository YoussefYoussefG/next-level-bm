# BM - Business Management Service

A "Next Level" Node.js backend API showcasing Clean Architecture, strictly typed structures, and enterprise-grade validation. 
Built as a standout standalone project for recruitment and portfolio showcasing.

## 💼 What Does This Project Do & Primary Use Cases?

This backend system functions as the "brain" for an e-commerce or B2B business operations software. It provides the necessary tools for an organization to manage employees, maintain a catalog of physical or digital products, process orders automatically, and review business analytics.

**How organizations/clients use this layer:**

1. **Staff Administration**: The `ADMIN` role can sign up staff into the system, securely controlling entry to features via JWT.
2. **Catalog Scaling**: Organizations can hit entity APIs (ex: `POST /api/products`) to add real-wear models, manage pricing, and stock.
3. **Cart Workflows**: Frontend applications (e.g. Next.js storefronts or React Native apps) connect to this service so users can submit "Checkout" API calls that automatically check items against existing stock volumes. 
4. **Performance Checkins**: An exclusive Analytics endpoint quickly computes total platform cash flow without exporting the Database to excel first.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod (Input validation schemas)
- **Authentication**: JWT & bcryptjs (Role-based access control)

## 📂 Architecture (Clean Architecture)

The codebase implements a decoupled `Controller-Service-Route` architecture to ensure it remains modular and easy to scale:

- `src/routes/`: API endpoint definitions and route bounding.
- `src/controllers/`: Receives requests, triggers services, and formulates HTTP responses.
- `src/services/`: Core business logic, computations, and Prisma database queries. 
- `src/schemas/`: Zod validation schemas determining acceptable data shapes.
- `src/middlewares/`: Express middlewares (Auth, Route-level validators, generic error handling).
- `src/utils/`: Generic helper functions, custom error classes, formatted logger, etc.

## 🎯 Features Core

1. **Authentication & Roles**: Secure JWT-based login with role-based access control (`ADMIN` & `EMPLOYEE`).
2. **Entity Management**: Strict CRUD systems controlling `Product`, `Order`, and user inventories.
3. **Analytics Endpoint**: Fast and aggregated computational logic analyzing total sales, stock health, and business performance.

## 🛠 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** (running locally, via Docker, or a cloud provider)
- **Git**

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/next-level-bm.git
   cd next-level-bm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy the example config to your local active `.env`.
   ```bash
   cp .env.example .env
   ```
   > *Configure your `DATABASE_URL` (requires a running PostgreSQL instance) and `JWT_SECRET`.*

3. **Database Migrations** (Prisma):
   ```bash
   npx prisma migrate dev
   ```

4. **Launch Application**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

This project uses **Jest** and **Supertest** to ensure API endpoint reliability. 

1. **Run Tests**:
   Execute the full test suite using:
   ```bash
   npm test
   ```

2. **Watch Mode** (Optional):
   You can add a `test:watch` script in `package.json` to keep tests running during active development:
   ```bash
   npm test -- --watch
   ```

