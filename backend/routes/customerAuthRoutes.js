import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  refreshCustomerToken,
  getCustomerProfile,
  updateCustomerProfile,
  toggleCustomerWishlist,
  googleCustomerLogin
} from '../controllers/customerAuthController.js';
import { requireCustomerAuth, customerAuthLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public storefront endpoints
router.post('/register', customerAuthLimiter, registerCustomer);
router.post('/login', customerAuthLimiter, loginCustomer);
router.post('/refresh', refreshCustomerToken);
router.post('/google', googleCustomerLogin);

// Protected customer endpoints
router.route('/profile')
  .get(requireCustomerAuth, getCustomerProfile)
  .put(requireCustomerAuth, updateCustomerProfile);

router.post('/wishlist', requireCustomerAuth, toggleCustomerWishlist);

export default router;
