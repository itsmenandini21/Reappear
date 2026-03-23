import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { submitApplication, getStudentInfo, reportIssue, getFeeTrackerApplications, updateFeeTrackerStatus } from '../controllers/applicationController.js';
import {protect, admin} from '../middleware/authMiddleware.js'; // Ensure this exists to protect routes

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');

fs.mkdirSync(receiptsDir, { recursive: true });

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, receiptsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const receiptUpload = multer({
  storage: receiptStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPG, PNG, and PDF receipt files are allowed'), false);
  }
});

const handleReceiptUpload = (req, res, next) => {
  receiptUpload.single('receipt')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || 'Receipt upload failed' });
    }

    next();
  });
};

// Student details fetch karne ke liye (pre-fill ke liye)
router.get('/student-info', protect, getStudentInfo);

// Application submit karne ke liye
router.post('/apply', protect, handleReceiptUpload, submitApplication);
// Issue report form (from Footer)
router.post('/report-issue', protect, reportIssue);
router.get('/admin/fee-tracker', protect, admin, getFeeTrackerApplications);
router.patch('/admin/fee-tracker/:id', protect, admin, updateFeeTrackerStatus);

export default router;
