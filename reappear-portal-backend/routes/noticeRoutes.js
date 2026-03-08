import express from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';

const router = express.Router();

// Student Route
router.get('/', getNotices);

// Admin Routes
router.post('/', createNotice);
router.delete('/:id', deleteNotice);

// THIS IS THE CRUCIAL LINE FIXING YOUR ERROR!
export default router;