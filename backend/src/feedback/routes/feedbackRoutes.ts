import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { createFeedbackHandler, listFeedbackHandler } from '../controllers/feedbackController';

const router = Router();

router.use(authMiddleware as any);
router.use(tenantMiddleware as any);

router.post('/', createFeedbackHandler as any);
router.get('/', listFeedbackHandler as any);

export default router;
