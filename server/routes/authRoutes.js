import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Authentication Endpoints (Rate Limited to prevent brute force)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected Authentication Endpoints
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

export default router;

