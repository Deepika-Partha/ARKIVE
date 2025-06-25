import dotenv from 'dotenv';
dotenv.config(); 

import express, { json } from 'express';
import cors from 'cors'; // <-- ADD THIS
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(json());
app.use(cookieParser());

import authRouter from './auth.js';

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});
app.use('/api', authRouter); 

import { connect } from 'mongoose';

connect(process.env.MONGO_DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// app.listen(5000, () => console.log('Express server running on port 5000'));

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});


