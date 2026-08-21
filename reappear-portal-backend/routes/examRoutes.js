import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getStudentExams,
    getAllExams,
    scheduleExam,
    deleteExam,
    updateExam
} from '../controllers/examController.js';

const router = express.Router();

// GET /api/exams - get student filtered exams/results
router.get('/', getStudentExams);

// GET /api/exams/all - get all exams for admin
router.get('/all', protect, getAllExams);

// POST /api/exams - schedule a new exam
router.post('/', scheduleExam);

// DELETE /api/exams/:id - delete an exam
router.delete('/:id', deleteExam);

// PUT /api/exams/:id - update an exam
router.put('/:id', updateExam);

export default router;
