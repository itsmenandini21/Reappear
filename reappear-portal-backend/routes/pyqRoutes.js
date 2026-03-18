import express from 'express';
import { getPyqs, uploadPyq } from '../controllers/pyqController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Security ke liye

const router = express.Router();

// @desc    Get PYQs (Public/Student)
// @route   GET /api/pyq
router.get('/', protect, getPyqs); 

// @desc    Upload PYQ (Admin Only)
// @route   POST /api/pyq/upload
// Key 'file' matching with Frontend data.append('file', file)
router.post('/upload', protect,upload.single('file'), uploadPyq);

export default router;