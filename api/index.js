import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingsRouter from './routes/listing.route.js';
dotenv.config({ path: './.env' });
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = 3000;

//routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingsRouter);

//middlewares
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'internal server error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

//db config
mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log('DB connected successfully');
  })
  .catch(error => {
    console.log(`there was an error connectin to the db:`, error);
  });

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
