import request from 'supertest';
import app from '../index';

describe('Health Check API', () => {
  it('should return a success response and the proper message', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'BM - Business Management Service API is running ✨');
  });
});