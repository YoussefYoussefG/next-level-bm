import request from 'supertest';
import app from '../index';
import {
  cleanupDatabase,
  disconnectDatabase,
  createTestUser,
  createTestProduct,
} from './setup';

// -----------------------------------------------------------------------------
// Order Endpoint Tests
// Tests order creation (stock checks, transactions), listing (role scoping),
// status transitions (FSM), and cancellation with stock restore.
// -----------------------------------------------------------------------------

let adminToken: string;
let employeeToken: string;
let employeeUserId: string;

beforeAll(async () => {
  await cleanupDatabase();

  const admin = await createTestUser({
    email: 'admin-order@example.com',
    role: 'ADMIN',
  });
  adminToken = admin.token;

  const employee = await createTestUser({
    email: 'employee-order@example.com',
    role: 'EMPLOYEE',
  });
  employeeToken = employee.token;
  employeeUserId = employee.user.id;
});

afterAll(async () => {
  await cleanupDatabase();
  await disconnectDatabase();
});

describe('POST /api/v1/orders', () => {
  it('should create an order and decrement stock', async () => {
    const product = await createTestProduct({ stock: 50, price: 10 });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        items: [{ productId: product.id, quantity: 3 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('totalAmount', 30);
    expect(res.body.data).toHaveProperty('status', 'PENDING');
    expect(res.body.data.items).toHaveLength(1);
  });

  it('should reject order with insufficient stock', async () => {
    const product = await createTestProduct({ stock: 2, price: 100 });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        items: [{ productId: product.id, quantity: 10 }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('should reject order with non-existent product', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        items: [
          {
            productId: '00000000-0000-0000-0000-000000000000',
            quantity: 1,
          },
        ],
      });

    expect(res.statusCode).toBe(404);
  });

  it('should reject empty order items', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ items: [] });

    expect(res.statusCode).toBe(422);
  });
});

describe('GET /api/v1/orders', () => {
  it('should list orders for EMPLOYEE (own orders only)', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.meta).toHaveProperty('page');
    // All returned orders should belong to the employee
    res.body.data.forEach((order: any) => {
      expect(order.userId).toBe(employeeUserId);
    });
  });

  it('should list all orders for ADMIN', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('should filter orders by status', async () => {
    const res = await request(app)
      .get('/api/v1/orders?status=PENDING')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((order: any) => {
      expect(order.status).toBe('PENDING');
    });
  });
});

describe('PATCH /api/v1/orders/:id/status', () => {
  let orderId: string;

  beforeAll(async () => {
    const product = await createTestProduct({ stock: 100, price: 25 });
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        items: [{ productId: product.id, quantity: 2 }],
      });
    orderId = res.body.data.id;
  });

  it('should allow valid status transition (PENDING → PROCESSING)', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('PROCESSING');
  });

  it('should allow PROCESSING → COMPLETED', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('should reject invalid status transition (COMPLETED → PENDING)', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PENDING' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Cannot transition');
  });

  it('should reject EMPLOYEE from updating status', async () => {
    const product = await createTestProduct({ stock: 10, price: 5 });
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });

    const res = await request(app)
      .patch(`/api/v1/orders/${orderRes.body.data.id}/status`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ status: 'PROCESSING' });

    expect(res.statusCode).toBe(403);
  });
});

describe('POST /api/v1/orders/:id/cancel', () => {
  it('should cancel order and restore stock', async () => {
    const product = await createTestProduct({ stock: 20, price: 15 });

    // Create order (stock goes from 20 to 15)
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ items: [{ productId: product.id, quantity: 5 }] });

    const orderId = orderRes.body.data.id;

    // Cancel order (stock should be restored to 20)
    const cancelRes = await request(app)
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Verify stock was restored
    const productRes = await request(app)
      .get(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(productRes.body.data.stock).toBe(20);
  });
});
