import request from 'supertest';
import app from '../index';
import {
  cleanupDatabase,
  disconnectDatabase,
  createTestUser,
} from './setup';

// -----------------------------------------------------------------------------
// Analytics Endpoint Tests
// Tests admin-only dashboard access and data shape.
// -----------------------------------------------------------------------------

let adminToken: string;
let employeeToken: string;

beforeAll(async () => {
  await cleanupDatabase();

  const admin = await createTestUser({
    email: 'admin-analytics@example.com',
    role: 'ADMIN',
  });
  adminToken = admin.token;

  const employee = await createTestUser({
    email: 'employee-analytics@example.com',
    role: 'EMPLOYEE',
  });
  employeeToken = employee.token;
});

afterAll(async () => {
  await cleanupDatabase();
  await disconnectDatabase();
});

describe('GET /api/v1/analytics/dashboard', () => {
  it('should return dashboard stats for ADMIN', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('revenue');
    expect(res.body.data).toHaveProperty('orders');
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('revenueOverTime');

    // Check nested structures
    expect(res.body.data.revenue).toHaveProperty('total');
    expect(res.body.data.revenue).toHaveProperty('completed');
    expect(res.body.data.orders).toHaveProperty('total');
    expect(res.body.data.orders).toHaveProperty('byStatus');
    expect(res.body.data.products).toHaveProperty('total');
    expect(res.body.data.products).toHaveProperty('topSelling');
    expect(res.body.data.products).toHaveProperty('lowStock');
    expect(res.body.data.users).toHaveProperty('total');
    expect(res.body.data.users).toHaveProperty('byRole');
  });

  it('should reject EMPLOYEE access', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard');

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /health', () => {
  it('should return enhanced health status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status', 'healthy');
    expect(res.body.database).toHaveProperty('responseTimeMs');
  });
});
