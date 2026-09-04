import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  getOverviewData,
  getStudentsList,
  updateStudent,
  deleteStudent,
  getChatAnalytics,
} from '../controllers/adminController';

const router = Router();

// Require logged in user with college_admin or admin or platform_admin role
const requireAdminRole = requireRole(['college_admin', 'admin', 'platform_admin']);

router.get('/overview', requireAuth, requireAdminRole, getOverviewData);
router.get('/students', requireAuth, requireAdminRole, getStudentsList);
router.patch('/students/:id', requireAuth, requireAdminRole, updateStudent);
router.delete('/students/:id', requireAuth, requireAdminRole, deleteStudent);
router.get('/chat-analytics', requireAuth, requireAdminRole, getChatAnalytics);

export default router;
