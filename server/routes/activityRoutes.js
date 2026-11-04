import express from 'express';
import { getRecentActivities } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getRecentActivities);

export default router;
