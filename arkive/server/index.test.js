import 'dotenv/config';
import mongoose from 'mongoose';

jest.mock('mongoose', () => ({
  Schema: function () { return {}; },
  model: jest.fn(() => ({})),
  connect: jest.fn(() => Promise.resolve()),
}));

jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  const use = jest.fn();
  const listen = jest.fn((port, cb) => cb && cb());
  return Object.assign(() => ({
    use,
    listen,
  }), actualExpress, { json: jest.fn(() => 'json-middleware') });
});

jest.mock('./auth.js', () => 'mock-auth-router', { virtual: true });

import User from './User.js';

describe('User Model', () => {
  it('should be defined', () => {
    expect(User).toBeDefined();
  });
});

describe('Server index.js', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.MONGO_DB_URI = 'mongodb://localhost:27017/test';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it('should connect to MongoDB without error', async () => {
    await import('./index.js');
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
  });
  it('should log MongoDB connected on successful connection', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await import('./index.js');
    expect(logSpy).toHaveBeenCalledWith('MongoDB connected');
    logSpy.mockRestore();
  });
  it('should set up express app with json middleware and auth router', async () => {
    const expressMock = require('express');
    await import('./index.js');
    expect(expressMock.json).toHaveBeenCalled();
    expect(expressMock().use).toHaveBeenCalledWith('json-middleware');
    expect(expressMock().use).toHaveBeenCalledWith('/api', 'mock-auth-router');
  });
  it('should start express server on port 5000', async () => {
    const expressMock = require('express');
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await import('./index.js');
    expect(expressMock().listen).toHaveBeenCalledWith(5000, expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith('Express server running on port 5000');
    logSpy.mockRestore();
  });
  it('should log MongoDB connection error on failure', async () => {
    const error = new Error('fail');
    const mongoose = require('mongoose');
    mongoose.connect.mockImplementationOnce(() => Promise.reject(error));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await import('./index.js');
    await new Promise(process.nextTick);
    expect(errorSpy).toHaveBeenCalledWith('MongoDB connection error:', error);
    errorSpy.mockRestore();
  });
});