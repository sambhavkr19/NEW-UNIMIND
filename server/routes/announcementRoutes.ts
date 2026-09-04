import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';

const router = Router();

router.get('/', requireAuth, getAnnouncements);
router.post('/', requireAuth, requireRole(['college_admin', 'admin', 'platform_admin']), createAnnouncement);
router.delete('/:id', requireAuth, requireRole(['college_admin', 'admin', 'platform_admin']), deleteAnnouncement);

export default router;
