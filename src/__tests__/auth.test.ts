import request from 'supertest';
import app from '../index';
import { cleanupDatabase, disconnectDatabase, createTestUser } from './setup';

// -----------------------------------------------------------------------------
// Auth Endpoint Tests
// Tests registration, login, profile, and token refresh flows.
// -----------------------------------------------------------------------------

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await disconnectDatabase();
});

describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'StrongPass1',
        name: 'New User',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).toHaveProperty('email', 'newuser@example.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should reject duplicate email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'StrongPass1',
        name: 'First User',
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'StrongPass1',
        name: 'Second User',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.status).toBe('error');
  });

  it('should reject weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'weakpass@example.com',
        password: '123',
        name: 'Weak Pass User',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: 'StrongPass1',
        name: 'Bad Email User',
      });

    expect(res.statusCode).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await createTestUser({
      email: 'login-test@example.com',
      password: 'LoginPass1',
    });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'LoginPass1',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'WrongPass1',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'SomePass1',
      });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return profile for authenticated user', async () => {
    const { token } = await createTestUser({
      email: 'profile-test@example.com',
    });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('email', 'profile-test@example.com');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toBe(401);
  });
});
