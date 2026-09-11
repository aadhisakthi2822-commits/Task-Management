import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication to all task routes
router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', isAdmin, createTask);

router.get('/:id', getTaskById);
router.put('/:id', isAdmin, updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', isAdmin, deleteTask);

export default router;
