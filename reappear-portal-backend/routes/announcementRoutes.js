import express from 'express';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect,createAnnouncement); // Sirf admin post kar sakega
router.get('/', getAnnouncements); // Student aur admin dono dekh sakenge

export default router;