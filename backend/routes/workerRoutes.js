import express from 'express';
import { getWorkers, addWorker, updateWorker, assignTask, updateTaskStatus, logAttendance } from '../controllers/workerController.js';
import { protect, admin, workerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getWorkers)
  .post(protect, admin, addWorker);

router.put('/:id', protect, admin, updateWorker);
router.post('/:id/tasks', protect, admin, assignTask);
router.put('/:id/tasks/:taskId', protect, workerOrAdmin, updateTaskStatus);
router.post('/:id/attendance', protect, admin, logAttendance);

export default router;
