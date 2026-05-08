import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { createFeedbackHandler, listFeedbackHandler } from '../controllers/feedbackController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.post('/', createFeedbackHandler);
router.get('/', listFeedbackHandler);
export default router;
