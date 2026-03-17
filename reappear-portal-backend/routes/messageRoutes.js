import express from 'express';
import { 
    getChatHistory, 
    sendMessage, 
    getActiveConversations, 
    getUnreadStats 
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);
router.get('/stats/:userName', getUnreadStats);
router.get('/history/:user1/:user2', getChatHistory);
router.get('/conversations/:userName', getActiveConversations); // Sidebar ke liye

export default router;