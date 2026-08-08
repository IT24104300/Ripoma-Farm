import express from 'express';
import { createOrder, getMyOrders, getOrderById, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, workerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, workerOrAdmin, getOrders);

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/status', protect, workerOrAdmin, updateOrderStatus);

export default router;
