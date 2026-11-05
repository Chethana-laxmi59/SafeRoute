import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sosRoutes from './routes/sosRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robustly load environment variables from server/.env regardless of launch directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // fallback for root .env if present

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'SafeRoute API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);

// Root friendly welcome message
app.get('/', (req, res) => {
  res.send('SafeRoute Emergency Assistance Platform Backend API is running.');
});

// 404 Route handler for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[SafeRoute API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

