import express from 'express';
import { getInventoryLogs, restockProduct } from '../controllers/inventoryController.js';
import { protect, workerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/logs', protect, workerOrAdmin, getInventoryLogs);
router.post('/restock', protect, workerOrAdmin, restockProduct);

export default router;
