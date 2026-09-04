import { Router } from 'express';
import { registerStudent, loginUser, getProfile } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Student Registration
router.post('/register', registerStudent);

// Student and Admin Login
router.post('/login', loginUser);

// Profile (Protected)
router.get('/profile', requireAuth as any, getProfile);

export default router;
