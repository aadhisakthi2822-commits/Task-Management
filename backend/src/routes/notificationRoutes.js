import express from 'express';
import {
  getEmailLogs,
  getEmailLogById,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/emails', getEmailLogs);
router.get('/emails/:id', getEmailLogById);

export default router;
