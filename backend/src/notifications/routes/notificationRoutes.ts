import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { listNotificationsHandler, markNotificationSeenHandler } from '../controllers/notificationController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.get('/', listNotificationsHandler);
router.patch('/:id/seen', markNotificationSeenHandler);

export default router;
