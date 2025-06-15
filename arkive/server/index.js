import dotenv from 'dotenv';
dotenv.config(); 

import express, { json } from 'express';
const app = express();
import authRouter from './routes/auth.js';

app.use(json());
app.use('/api', authRouter); 

import { connect } from 'mongoose';
connect(process.env.MONGO_DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => console.log('Express server running on port 5000'));