import express from 'express';
import { registerUser, authUser, getUserProfile, updateUserProfile, googleLogin, toggleWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.post('/wishlist', protect, toggleWishlist);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
