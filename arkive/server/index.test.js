import 'dotenv/config';
import mongoose from 'mongoose';

jest.mock('mongoose', () => ({
  connect: jest.fn(() => Promise.resolve()),
}));

it('should connect to MongoDB without error', async () => {
  process.env.MONGO_DB_URI = 'mongodb://localhost:27017/test';
  await import('./index.js');
  expect(mongoose.connect).toHaveBeenCalled();
});