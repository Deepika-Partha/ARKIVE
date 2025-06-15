import { jest } from '@jest/globals';
import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './auth.js';
import User from '../models/User.js';

const TEST_DB_URI = process.env.MONGO_DB_URI;

const app = express();
app.use(express.json());
app.use('/api', authRouter);

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('Auth API', () => {
  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'testpass123';

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Registration successful');
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('Email already registered');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: testEmail, password: 'wrongpass' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should fail if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: '' }); // missing password
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Email and password required');
  });

  it('should fail if email format is invalid', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'notanemail', password: '12345' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  it('should fail if password is too short', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'testshort@example.com', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Password must be at least 5 characters long');
  });

  it('should logout the user', async () => {
    const res = await request(app)
      .post('/api/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logged out');
  });

  it('should return 500 if registration fails for other reasons', async () => {
    jest.spyOn(User, 'create').mockImplementationOnce(() => {
      const err = new Error('Some DB error');
      err.code = 99999; // Not 11000
      throw err;
    });

    const res = await request(app)
      .post('/api/register')
      .send({ email: 'failcase@example.com', password: '12345' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Registration failed');
  });
});