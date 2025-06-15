//server/index.js
require('dotenv').config(); //load .env
import express, { json } from 'express';
const app = express();
import authRouter from './routes/auth';

app.use(json()); //parse JSON bodies
app.use('/api', authRouter); //mount auth routes at /api

//connect to MongoDB
import { connect } from 'mongoose';
connect(process.env.MONGO_DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => console.log('Express server running on port 5000'));