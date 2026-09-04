import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  getPlatformAnalytics,
  getColleges,
  createCollege,
  getCollegeAdmins,
  getSystemMonitor,
  getSystemLogs,
  getPlatformSettings,
  updatePlatformSettings,
} from '../controllers/platformController';

const router = Router();

// Allow platform_admin or admin
const requirePlatformRole = requireRole(['platform_admin', 'admin']);

router.get('/analytics', requireAuth, requirePlatformRole, getPlatformAnalytics);
router.get('/colleges', requireAuth, requirePlatformRole, getColleges);
router.post('/colleges', requireAuth, requirePlatformRole, createCollege);
router.get('/admins', requireAuth, requirePlatformRole, getCollegeAdmins);
router.get('/monitor', requireAuth, requirePlatformRole, getSystemMonitor);
router.get('/logs', requireAuth, requirePlatformRole, getSystemLogs);
router.get('/settings', requireAuth, requirePlatformRole, getPlatformSettings);
router.patch('/settings', requireAuth, requirePlatformRole, updatePlatformSettings);

export default router;
