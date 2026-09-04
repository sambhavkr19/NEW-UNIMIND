import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../controllers/ticketController';

const router = Router();

// Protect all support ticket routes
router.use(requireAuth as any);

router.get('/', getTickets);
router.post('/', createTicket);
router.patch('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router;
