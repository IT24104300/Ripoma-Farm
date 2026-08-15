import express from 'express';
import customerAuthRoutes from './customerAuthRoutes.js';
import adminAuthRoutes from './adminAuthRoutes.js';
import {
  registerCustomer,
  loginCustomer,
  googleCustomerLogin,
  getCustomerProfile,
  updateCustomerProfile,
  toggleCustomerWishlist
} from '../controllers/customerAuthController.js';
import { requireCustomerAuth, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mount Dedicated Sub-Routers
router.use('/customer', customerAuthRoutes);
router.use('/admin', adminAuthRoutes);

// Legacy Root Aliases for backward compatibility
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/google', googleCustomerLogin);
router.post('/wishlist', protect, toggleCustomerWishlist);
router.route('/profile')
  .get(protect, getCustomerProfile)
  .put(protect, updateCustomerProfile);

export default router;
