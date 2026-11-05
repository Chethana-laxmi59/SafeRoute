import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/login', login);

// Protected Authentication Endpoints
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

export default router;

