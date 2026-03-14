import express from 'express';
import { submitApplication, getStudentInfo } from '../controllers/applicationController.js';
import {protect} from '../middleware/authMiddleware.js'; // Ensure this exists to protect routes

const router = express.Router();

// Student details fetch karne ke liye (pre-fill ke liye)
router.get('/student-info', protect, getStudentInfo);

// Application submit karne ke liye
router.post('/apply', protect, submitApplication);

export default router;