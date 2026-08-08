import express from 'express';
import { getDashboardStats, getTransactions, createTransaction } from '../controllers/transactionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getTransactions)
  .post(protect, admin, createTransaction);

router.get('/stats', protect, admin, getDashboardStats);

export default router;
