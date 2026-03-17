import express from 'express';
// Import the dynamic database logic from the controller we just made
import { getPeers } from '../controllers/peerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student Route: Automatically fetches ONLY students with 'pending' or 'in-progress' status from MongoDB
router.get('/', protect, getPeers);

export default router;