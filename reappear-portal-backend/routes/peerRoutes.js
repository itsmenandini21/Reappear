import express from 'express';
// Import the dynamic database logic from the controller we just made
import { getPeers, addReappear, updateReappearStatus } from '../controllers/peerController.js';

const router = express.Router();

// Student Route: Automatically fetches ONLY students with 'pending' or 'in-progress' status from MongoDB
router.get('/', getPeers);

// Admin Routes: Allows Admin to add new backlogs or change status to 'cleared'
router.post('/add', addReappear);
router.put('/update/:id', updateReappearStatus);

export default router;