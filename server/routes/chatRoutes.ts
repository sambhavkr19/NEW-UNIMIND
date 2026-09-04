import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getConversations,
  createConversation,
  getConversationById,
  deleteConversation,
  sendMessage,
} from '../controllers/chatController';

const router = Router();

// Protect all chat routes
router.use(requireAuth as any);

// Conversations management
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversationById);
router.delete('/conversations/:id', deleteConversation);

// Messaging within a conversation
router.post('/conversations/:id/messages', sendMessage);

export default router;
