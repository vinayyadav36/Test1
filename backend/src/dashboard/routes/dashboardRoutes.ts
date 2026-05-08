import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { getDashboardSummaryHandler } from '../controllers/dashboardController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.get('/summary', getDashboardSummaryHandler);

export default router;
