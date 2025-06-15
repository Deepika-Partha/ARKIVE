const request = require('supertest');
const express = require('express');

let authRouter;

beforeAll(async () => {
  // Dynamically import the ES module
  const mod = await import('./auth.js');
  authRouter = mod.default;
});

const app = express();
app.use(express.json());

beforeAll(() => {
  app.use('/api', authRouter);
});

describe('Auth API', () => {
  it('should reject registration with missing fields', async () => {
    const res = await request(app).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password required');
  });

  it('should reject login with missing fields', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid email or password');
  });
});