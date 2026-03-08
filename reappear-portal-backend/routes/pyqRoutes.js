import express from 'express';
import { getPyqs, uploadPyq } from '../controllers/pyqController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getPyqs);

// The 'pdfFile' string is the exact form-data key your frontend must use!
router.post('/upload', upload.single('pdfFile'), uploadPyq);

export default router;