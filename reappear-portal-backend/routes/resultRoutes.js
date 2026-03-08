import express from 'express';
import { getStudentResults, addResult } from '../controllers/resultController.js';

const router = express.Router();

// Student Route (Needs their specific ID to fetch their specific results)
router.get('/:studentId', getStudentResults);

// Admin Route (To post the new grades)
router.post('/', addResult);

export default router;