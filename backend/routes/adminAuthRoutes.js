import express from 'express';
import {
  loginAdmin,
  verifyAdmin2FA,
  refreshAdminToken,
  getAdminProfile
} from '../controllers/adminAuthController.js';
import { requireAdminAuth, adminAuthLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly reachable admin login steps with strict rate limiting
router.post('/login', adminAuthLimiter, loginAdmin);
router.post('/verify-2fa', adminAuthLimiter, verifyAdmin2FA);
router.post('/refresh', refreshAdminToken);

// Protected admin profile endpoint
router.get('/profile', requireAdminAuth, getAdminProfile);

export default router;
