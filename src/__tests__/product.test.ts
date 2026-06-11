import request from 'supertest';
import app from '../index';
import {
  cleanupDatabase,
  disconnectDatabase,
  createTestUser,
  createTestProduct,
} from './setup';

// -----------------------------------------------------------------------------
// Product Endpoint Tests
// Tests CRUD operations, auth/role guards, validation, and pagination.
// -----------------------------------------------------------------------------

let adminToken: string;
let employeeToken: string;

beforeAll(async () => {
  await cleanupDatabase();

  const admin = await createTestUser({
    email: 'admin-product@example.com',
    role: 'ADMIN',
  });
  adminToken = admin.token;

  const employee = await createTestUser({
    email: 'employee-product@example.com',
    role: 'EMPLOYEE',
  });
  employeeToken = employee.token;
});

afterAll(async () => {
  await cleanupDatabase();
  await disconnectDatabase();
});

describe('POST /api/v1/products', () => {
  it('should create a product as ADMIN', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Widget',
        description: 'A fine widget',
        price: '29.99',
        stock: 50,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('name', 'Test Widget');
    expect(res.body.data).toHaveProperty('price', 29.99);
  });

  it('should reject EMPLOYEE creating a product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        name: 'Unauthorized Widget',
        price: '10.00',
      });

    expect(res.statusCode).toBe(403);
  });

  it('should reject invalid price format', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bad Price Widget',
        price: '29.999', // 3 decimal places — invalid
      });

    expect(res.statusCode).toBe(422);
  });

  it('should reject negative stock', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Neg Stock Widget',
        price: '10.00',
        stock: -5,
      });

    expect(res.statusCode).toBe(422);
  });
});

describe('GET /api/v1/products', () => {
  beforeAll(async () => {
    // Create some products for listing tests
    for (let i = 1; i <= 5; i++) {
      await createTestProduct({
        name: `Listing Product ${i}`,
        price: i * 10,
        stock: i * 20,
      });
    }
  });

  it('should list products with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/products?page=1&limit=3')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
    expect(res.body.meta).toHaveProperty('page', 1);
    expect(res.body.meta).toHaveProperty('totalPages');
    expect(res.body.meta).toHaveProperty('hasNextPage');
  });

  it('should search products by name', async () => {
    const res = await request(app)
      .get('/api/v1/products?search=Listing')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should filter products by price range', async () => {
    const res = await request(app)
      .get('/api/v1/products?minPrice=20&maxPrice=30')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((product: any) => {
      expect(product.price).toBeGreaterThanOrEqual(20);
      expect(product.price).toBeLessThanOrEqual(30);
    });
  });
});

describe('GET /api/v1/products/:id', () => {
  it('should return a single product', async () => {
    const product = await createTestProduct({ name: 'Single Fetch Product' });

    const res = await request(app)
      .get(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Single Fetch Product');
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should return 422 for invalid UUID', async () => {
    const res = await request(app)
      .get('/api/v1/products/not-a-uuid')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(422);
  });
});

describe('PATCH /api/v1/products/:id', () => {
  it('should update a product as ADMIN', async () => {
    const product = await createTestProduct({ name: 'Before Update' });

    const res = await request(app)
      .patch(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'After Update' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'After Update');
  });
});

describe('DELETE /api/v1/products/:id', () => {
  it('should soft-delete a product as ADMIN', async () => {
    const product = await createTestProduct({ name: 'To Be Deleted' });

    const res = await request(app)
      .delete(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);

    // Should not appear in list
    const listRes = await request(app)
      .get(`/api/v1/products/${product.id}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(listRes.statusCode).toBe(404);
  });
});
