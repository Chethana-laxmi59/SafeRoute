import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import { seedDefaultResources } from './config/seedResources.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import validateEnv from './utils/validateEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robustly load environment variables from server/.env regardless of launch directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // fallback for root .env if present

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Seed initial demo safety resources
connectDB().then(() => {
  seedDefaultResources();
});

// Security HTTP Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Disable Express fingerprint header
app.disable('x-powered-by');

// Production & Development CORS Configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, postman)
      if (!origin) return callback(null, true);

      // In non-production modes, allow local development origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // In production mode, check against permitted client origins
      const isAllowed =
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes('*') ||
        (process.env.VERCEL_URL && origin.includes('vercel.app'));

      if (isAllowed) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '100kb' })); // Mitigate large payload DoS attacks
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Apply General Rate Limiter to all /api endpoints
app.use('/api', generalLimiter);

// Health Check API route (public, unaffected by auth)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'SafeRoute API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/resources', resourceRoutes);

// Root friendly welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SafeRoute Emergency Assistance Platform API',
    status: 'active',
    documentation: '/api/health',
    mode: process.env.NODE_ENV || 'development',
  });
});

// 404 Route handler for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware (Never leak stack traces in production)
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Origin not allowed by CORS policy',
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.error('[Server Error]', err.stack || err.message);
  } else {
    console.error('[Server Error]', err.message);
  }

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
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(
    `[SafeRoute API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

