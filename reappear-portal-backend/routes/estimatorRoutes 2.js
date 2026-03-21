import express from 'express';
import { getFailRateEstimation, getEstimatorOptions } from '../controllers/estimatorController.js';

const router = express.Router();

// GET /api/estimator/options
router.get('/options', getEstimatorOptions);

// GET /api/estimator/fail-rate/:subjectId
router.get('/fail-rate/:subjectId', getFailRateEstimation);

export default router;
