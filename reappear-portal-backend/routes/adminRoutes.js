import express from 'express';
import { getOverviewStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview-stats', protect, admin, getOverviewStats);

export default router;
