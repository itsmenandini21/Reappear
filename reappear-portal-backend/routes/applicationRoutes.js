import express from 'express';
import { submitApplication, getStudentInfo, reportIssue } from '../controllers/applicationController.js';
import {protect} from '../middleware/authMiddleware.js'; // Ensure this exists to protect routes

const router = express.Router();

// Student details fetch karne ke liye (pre-fill ke liye)
router.get('/student-info', protect, getStudentInfo);

// Application submit karne ke liye
router.post('/apply', protect, submitApplication);
// Issue report form (from Footer)
router.post('/report-issue', protect, reportIssue);

export default router;