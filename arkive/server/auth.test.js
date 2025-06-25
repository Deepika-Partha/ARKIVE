import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
import request from 'supertest';
import express from 'express';
import authRouter from './auth.js';
import jwt from 'jsonwebtoken';
import User from './User.js';

jest.mock('./User.js');
jest.mock('jsonwebtoken');
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true)
}));
const app = express();
app.use(express.json());
app.use('/api', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    it('should return error if email or password is missing', async () => {
      const res = await request(app).post('/api/register').send({ email: '', password: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    it('should return error if email is invalid', async () => {
      const res = await request(app).post('/api/register').send({ email: 'bad', password: '12345' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid email/i);
    });
    it('should return error if password is too short', async () => {
      const res = await request(app).post('/api/register').send({ email: 'test@test.com', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 5 characters/i);
    });
    it('should return error if email already exists', async () => {
      User.create.mockRejectedValue({ code: 11000 });
      const res = await request(app).post('/api/register').send({ email: 'test@test.com', password: '12345' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already registered/i);
    });
    it('should return error on registration failure', async () => {
      User.create.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/api/register').send({ email: 'test2@test.com', password: '12345' });
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/registration failed/i);
    });
    it('should register a user successfully', async () => {
      User.create.mockResolvedValue({ email: 'test3@test.com', passwordHash: 'hashed' });
      const res = await request(app).post('/api/register').send({ email: 'test3@test.com', password: '12345' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registration successful');
    });
  });

  describe('POST /api/login', () => {
    it('should return error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app).post('/api/login').send({ email: 'test@test.com', password: 'wrong' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('should return token for valid credentials', async () => {
      User.findOne.mockResolvedValue({ _id: '1', email: 'test@test.com', passwordHash: 'hashed' });
      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt');
      const res = await request(app).post('/api/login').send({ email: 'test@test.com', password: 'password' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
    });
  });

  describe('POST /api/register', () => {
    it('should logout user', async () => {
      const res = await request(app).post('/api/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out');
    });
  });
});