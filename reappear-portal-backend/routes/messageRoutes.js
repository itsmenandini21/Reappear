import express from 'express';
import { getChatHistory, sendMessage, getAdminConversations } from '../controllers/messageController.js';

const router = express.Router();

// Admin Route: Gets the list of active chat threads
router.get('/admin/conversations', getAdminConversations);

// Shared Routes: Get a specific chat history, and send a message
router.get('/:userIdentifier', getChatHistory);
router.post('/', sendMessage);

export default router;