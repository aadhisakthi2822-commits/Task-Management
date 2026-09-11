import express from 'express';
import {
  getEmployees,
  createEmployee,
  getEmployeeById,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/employees', isAdmin, getEmployees);
router.post('/employees', isAdmin, createEmployee);
router.get('/employees/:id', isAdmin, getEmployeeById);

export default router;
